import React, { useEffect, useState } from "react";
import {
  DataTable,
  DataTableRowEditEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { InputNumber } from "primereact/inputnumber";
import { TTypeDatatableProps } from "../models/component/TTypedDatatableProps";
import { ColumnMeta } from "../models/component/ColumnMeta";
import { FilterMatchMode } from "primereact/api";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export function TTypedDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
  isNew,
  isSave,
  isEdit,
  isDelete,
  isSearch = true,
  onAdd,
  onEdit,
  onEditMultiple,
  onDelete,
  onSave,
  sortableColumns = [],
}: TTypeDatatableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingRowData, setEditingRowData] = useState<T | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const f: any = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
    columns.forEach((c) => {
      f[c.field] = { value: null, matchMode: FilterMatchMode.CONTAINS };
    });
    setFilters(f);
  }, [columns]);

  useEffect(() => {
    setTableData(data.map((d) => ({ ...d }))); // clone initial data
  }, [data]);

  const getNextPrimaryKey = (): string => {
    const maxId = Math.max(
      0,
      ...tableData.map((item) => Number(item[primaryKey]) || 0)
    );
    return (maxId + 1).toString();
  };

  const addRow = () => {
    // Prevent adding if any row is already being edited
    if (Object.keys(editingRows).length > 0) return;

    // Create new row with default values
    const newRow = {} as T;
    columns.forEach((col) => {
      if (col.type === "checkbox") (newRow[col.field] as any) = false;
      else (newRow[col.field] as any) = "";
    });

    // Assign primary key and mark as edited
    (newRow[primaryKey] as any) = 0; // or use getNextPrimaryKey() if you want incremental
    (newRow as any)._edited = true; // mark as new/edited
    (newRow as any)._tempKey = `temp-${Date.now()}-${Math.random()}`; // unique temp key

    // Add row to table
    setTableData(prev => [newRow, ...prev]);

    // Open this row in edit mode immediately using tempKey
    setEditingRows({ [(newRow as any)._tempKey]: true });
  };

  const validateRow = (rowData: T) => {
    const rowErrors: { [key: string]: string } = {};

    columns.forEach((col) => {
      // Conditional required for GST fields
      if (
        (col.field === "cgstRate" || col.field === "sgstRate") &&
        (rowData["isGSTIncludedInPrice"] as boolean) === true &&
        (rowData[col.field] === "" || rowData[col.field] == null)
      ) {
        rowErrors[col.field as string] = `${col.header} is required`;
      }

      // Normal required check
      else if (col.required && (rowData[col.field] === "" || rowData[col.field] == null)) {
        rowErrors[col.field as string] = `${col.header} is required`;
      }
    });

    return rowErrors;
  };

  const saveAll = () => {
    let valid = true;
    const allErrors: typeof errors = {};
    const rowsToReopen: { [key: string]: boolean } = {};

    const firstNonHiddenCol = columns.find(c => !c.hidden);
    if (!firstNonHiddenCol) return;

    const field = firstNonHiddenCol.field as string;
    const valueMap = new Map<any, string[]>();

    // 🔹 Collect values
    tableData.forEach((row) => {
      const key = (row as any)._tempKey || row[primaryKey];
      const value = row[field];

      if (value !== null && value !== undefined && value !== "") {
        if (!valueMap.has(value)) valueMap.set(value, []);
        valueMap.get(value)!.push(key);
      }
    });

    // 🔹 Detect duplicates
    valueMap.forEach((keys, value) => {
      if (keys.length > 1) {
        keys.forEach((key) => {
          allErrors[key] = {
            ...(allErrors[key] || {}),
            [field]: `${firstNonHiddenCol.header} already exists`
          };
          rowsToReopen[key] = true;
          valid = false;
        });
      }
    });

    // 🔹 Existing row validation
    tableData.forEach((row) => {
      const key = (row as any)._tempKey || row[primaryKey];
      const rowErrors = validateRow(row);

      if (Object.keys(rowErrors).length > 0) {
        allErrors[key] = { ...(allErrors[key] || {}), ...rowErrors };
        rowsToReopen[key] = true;
        valid = false;
      }
    });

    if (!valid) {
      setErrors(allErrors);
      setEditingRows(rowsToReopen);
      return;
    }

    setErrors({});
    setEditingRows({});

    if (onSave) {
      onSave(tableData);
    }
  };

  const handleValueChange = (value: any, options: any, col: ColumnMeta<T>) => {
    const field = col.field as keyof T;
    const rowData = options.rowData as T;

    setTableData((prev) =>
      prev.map((r) => {
        const isTempRow = (rowData as any)._tempKey !== undefined;
        const isMatchingRow = isTempRow
          ? (r as any)._tempKey === (rowData as any)._tempKey
          : r[primaryKey] === rowData[primaryKey];

        if (isMatchingRow) {
          const updatedRow = { ...r, [field]: value };

          // Mark the row as edited
          (updatedRow as any)._edited = true;

          // Call custom column-level handler if defined
          if (col.onValueChange) {
            col.onValueChange(updatedRow, value, prev, (newTable) => setTableData(newTable));
          }

          return updatedRow;
        }

        return r;
      })
    );

    // Sync PrimeReact editor state
    if (options.editorCallback) {
      options.editorCallback(value);
    }
  };

  const cellEditor = (options: any, col: ColumnMeta<T>) => {
    const rowId = options.rowData[primaryKey] as string;
    const fieldError = errors[rowId]?.[col.field as string];

    const showError =
      (col.required && (options.value === null || options.value === "")) ||
      !!errors[rowId]?.[col.field as string];

    const commonProps = {
      className: classNames({ "p-invalid": showError }),
      style: { width: "100%" },
    };

    switch (col.type) {
      case "select":
        return (
          <Dropdown
            value={options.value}
            options={col.options || []}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => options.editorCallback(e.value)}
            {...commonProps}
            placeholder={col.placeholder}
          />
        );

      case "date":
        return (
          <Calendar
            value={options.value ? new Date(options.value) : null}
            onChange={(e) => options.editorCallback(e.value)}
            dateFormat="yy-mm-dd"
            {...commonProps}
            placeholder={col.placeholder}
          />
        );

      case "checkbox":
        return (
          <div className="flex justify-center items-center h-full">
            <Checkbox
              checked={!!options.value}
              onChange={(e) => {
                // Ensure rowData and column info are passed
                handleValueChange(
                  e.checked,
                  { rowData: options.rowData, field: col.field, editorCallback: options.editorCallback },
                  col
                );
              }}
            />
          </div>
        );

      case "number":
        return (
          <InputNumber
            value={options.value}
            onValueChange={(e) => options.editorCallback(e.value)}
            mode="currency"
            currency="INR"
            locale="en-IN"
            {...commonProps}
            placeholder={col.placeholder}
          />
        );

      case "decimal":
        return (
          <InputNumber
            value={options.value}
            onValueChange={(e) => options.editorCallback(e.value)}
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={2}
            {...commonProps}
            placeholder={col.placeholder}
          />
        );

      case "gst":
        return (
          <InputNumber
            value={options.value}
            onValueChange={(e) =>
              handleValueChange(e.value, { ...options, field: col.field }, col)
            }
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={2}
            useGrouping={false}
            {...commonProps}
            placeholder={col.placeholder}
          />
        )

      default:
        return (
          <InputText
            value={options.value || ""}
            onChange={(e) => options.editorCallback(e.target.value)}
            {...commonProps}
            placeholder={col.placeholder}
          />
        );
    }
  };

  const rowEditorValidator = (rowData: T) => {
    const rowErrors = validateRow(rowData);
    const key = (rowData as any)._tempKey || (rowData[primaryKey] as string);

    if (Object.keys(rowErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [key]: rowErrors }));
      setEditingRows((prev) => ({ ...prev, [key]: true }));
      return false;
    }

    // ✅ preserve _edited flag for existing rows
    const updatedRow = {
      ...rowData,
      _edited: true // mark as edited when value was changed
    };

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    setTableData((prev) =>
      prev.map((item) =>
        ((item as any)._tempKey || item[primaryKey]) === key ? updatedRow : item
      )
    );

    setEditingRows((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    return true;
  };

  const handleDelete = () => {
    if (selectedRows.length === 0) return;

    confirmDialog({
      message: "Are you sure you want to delete the selected record(s)?",
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",
      acceptClassName: "p-button-danger p-button-sm",
      rejectClassName: "p-button-secondary p-button-sm",

      accept: () => {
        const remainingRows = tableData.filter(
          (row) => !selectedRows.some((sel) => sel[primaryKey] === row[primaryKey])
        );

        if (onDelete) {
          onDelete(selectedRows);
        }

        setTableData(remainingRows);
      }
    });
  };

  const isSaveEnabled = tableData.some((r) => r[primaryKey] === 0 || !!r._edited);

  const discardRow = (rowData: any) => {
    const key = (rowData as any)._tempKey || rowData[primaryKey];

    // Remove new rows completely
    if ((rowData as any)._tempKey || (rowData as any)._edited) {
      setTableData((prev) =>
        prev.filter((r) => (r as any)._tempKey !== (rowData as any)._tempKey)
      );
    }

    // Remove from editingRows
    setEditingRows((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    // Remove errors if any
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const actionBodyTemplate = (rowData: T) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-sm p-button-rounded p-button-outlined p-button-info"
      style={{ width: "25px", height: "25px", padding: "0" }}
      onClick={() => onEdit?.(rowData)}
    />
  );

  const addRowNew = () => {
    onAdd?.()
  }

  const onEditNew = () => {
    onEditMultiple?.(selectedRows);
  }

  return (
    <div className="card p-2 h-[calc(100vh-100px)] overflow-auto">

      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-2">
          {isNew && <Button label="Add" icon="pi pi-plus" outlined onClick={addRowNew} size="small" className="p-button-sm custom-xs" />}
          {isEdit && selectedRows.length > 1 && <Button label="Edit" icon="pi pi-pencil" outlined onClick={onEditNew} size="small" className="p-button-sm custom-xs" />}
          {isSave && isSaveEnabled && <Button label="Save" icon="pi pi-save" onClick={saveAll} disabled={!isSaveEnabled} size="small" className="p-button-sm custom-xs" />}
          {isDelete && selectedRows.length > 0 && (
            <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              onClick={() => handleDelete()}
              size="small"
              className="p-button-sm custom-xs"
            />
          )}
        </div>

        {isSearch &&
          <div className="ml-auto">
            <span className="p-input-icon-left relative w-64">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setFilters((prev: any) => ({
                    ...prev,
                    global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
                  }));
                }} placeholder="Search" />
              </IconField>
            </span>
          </div>
        }
      </div>


      <ConfirmDialog />

      <DataTable
        value={tableData}
        dataKey={(row) => (row as any)._tempKey || row[primaryKey]}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        editMode="row"
        editingRows={editingRows}
        onRowEditChange={(e: DataTableRowEditEvent) => setEditingRows(e.data)}
        selectionMode="checkbox"
        rowEditValidator={rowEditorValidator}
        size="small"
        scrollable
        style={{ width: "100%" }}
        rowClassName={(rowData, rowIndex: any) =>
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }
        filters={filters}
        globalFilterFields={columns.map((c) => c.field as string)}
        paginator
        rows={10} // rows per page
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowEditCancel={(e: DataTableRowEditEvent) => discardRow(e.data)}
        paginatorTemplate={
          isMobile
            ? "PrevPageLink NextPageLink CurrentPageReport"
            : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        }
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          header="No."
          body={(_, options) => options.rowIndex + 1}
          style={{ width: "70px", minWidth: "70px" }}
        />
        {columns.filter(col => !col.hidden).map((col) => (
          <Column
            key={String(col.field)}
            field={col.field as string}
            header={
              <>
                {col.header} {col.required && <span className="required-asterisk">*</span>}
              </>
            }
            editor={col.editable ? (options) => cellEditor(options, col) : undefined}
            body={col.body ? (rowData: T) => col.body!(rowData) : undefined}
            style={{
              width: col.width || "auto",
              minWidth: col.width || "120px",
            }}
            frozen={col.frozen}
            sortable={sortableColumns?.includes(col.field)}
          />
        ))}

        {isEdit && <Column body={actionBodyTemplate} header="Actions" style={{ width: "100px" }} frozen={true} />}
        {/* {isEdit &&
          <Column rowEditor headerStyle={{ width: "5rem" }} bodyStyle={{ textAlign: "center" }} frozen={true} alignFrozen="right" />} */}
      </DataTable>
    </div >
  );
}
