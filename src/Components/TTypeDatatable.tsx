import React, { useEffect, useState } from "react";
import {
  DataTable,
  DataTableRowEditCompleteEvent,
  DataTableRowEditEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { classNames } from "primereact/utils";
import { InputNumber } from "primereact/inputnumber";
import { TTypeDatatableProps } from "../models/component/TTypedDatatableProps";
import { ColumnMeta } from "../models/component/ColumnMeta";
import { FilterMatchMode } from "primereact/api";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export function TTypeDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
  isNew,
  isSave,
  isDelete,
  onEdit,
  onDelete,
  sortableColumns = [],
}: TTypeDatatableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(Array.isArray(data) ? data : []);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
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
    setTableData(Array.isArray(data) ? data.map(d => ({ ...d })) : []);
  }, [data]);

  const getNextPrimaryKey = (): string => {
    const maxId = Math.max(
      0,
      ...tableData.map((item) => Number(item[primaryKey]) || 0)
    );
    return (maxId + 1).toString();
  };

  // const addRow = () => {
  //   if (Object.keys(editingRows).length > 0) return;

  //   const newRow = {} as T;
  //   columns.forEach((col) => {
  //     if (col.type === "checkbox") (newRow[col.field] as any) = false;
  //     else (newRow[col.field] as any) = "";
  //   });
  //   (newRow[primaryKey] as any) = getNextPrimaryKey();

  //   const newData = [...tableData, newRow];
  //   setTableData(newData);

  //   const newKey = newRow[primaryKey] as string;
  //   setEditingRows({ [newKey]: true });
  // };

  const addRow = () => {
    if (Object.keys(editingRows).length > 0) return;

    const newRow = {} as T;
    columns.forEach((col) => {
      if (col.type === "checkbox") (newRow[col.field] as any) = false;
      else (newRow[col.field] as any) = "";
    });
    (newRow[primaryKey] as any) = getNextPrimaryKey();

    // Insert at the beginning
    const newData = [newRow, ...tableData];
    setTableData(newData);

    const newKey = newRow[primaryKey] as string;
    setEditingRows({ [newKey]: true });
  };

  const validateRow = (rowData: T) => {
    const rowErrors: { [key: string]: string } = {};

    columns.forEach((col) => {
      if (
        (col.field === "cgstRate" || col.field === "sgstRate") &&
        (rowData["isGSTIncludedInPrice"] as boolean) === true &&
        (rowData[col.field] === "" || rowData[col.field] == null)
      ) {
        rowErrors[col.field as string] = `${col.header} is required`;
      }

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

    // Only iterate over editing rows
    Object.keys(editingRows).forEach((key) => {
      const row = tableData.find((r) => r[primaryKey] === key);
      if (!row) return;

      const rowErrors = validateRow(row);
      if (Object.keys(rowErrors).length > 0) {
        allErrors[key] = rowErrors;
        rowsToReopen[key] = true; // Only reopen rows with errors that were being edited
        valid = false;
      }
    });

    if (!valid) {
      setErrors(allErrors);
      setEditingRows(rowsToReopen);
      return;
    }

    // Clear errors and editing rows after successful save
    setErrors({});
    setEditingRows({});
  };

  const handleValueChange = (value: any, options: any, col: ColumnMeta<T>) => {
    const field = (options?.column?.field || options?.field) as keyof T;

    if (!field) return;

    const rowData = options.rowData as T;

    const updatedTable = tableData.map((r) => {
      if ((r as any).id === (rowData as any).id) {
        let updatedRow = { ...r, [field]: value };

        if (col.onValueChange) {
          col.onValueChange(updatedRow, value, tableData, (newTable) => {
            setTableData(newTable);
          });
        }

        return updatedRow;
      }
      return r;
    });

    setTableData(updatedTable);
    if (options.editorCallback) options.editorCallback(value);
  };

  const cellEditor = (options: any, col: ColumnMeta<T>) => {
    const rowId = options.rowData[primaryKey] as string;
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
          />
        );
      case "selectsearch":   // 🔥 SEARCH + CLEAR + FILTER
        return (
          <Dropdown
            value={options.value}
            options={col.options || []}
            optionLabel="label"
            optionValue="value"
            filter              // 🔍 enables typing search
            showClear           // ❌ clear button
            filterInputAutoFocus
            onChange={(e) => options.editorCallback(e.value)}
            {...commonProps}
          />
        );

      case "date":
        return (
          <Calendar
            value={options.value ? new Date(options.value) : null}
            onChange={(e) => options.editorCallback(e.value)}
            dateFormat="yy-mm-dd"
            {...commonProps}
          />
        );

      case "checkbox":
        return (
          <div className="flex justify-center items-center h-full">
            <Checkbox
              checked={!!options.value}
              onChange={(e) => options.editorCallback(e.checked)}
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
          />
        );

      case "decimal":
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
            style={{ width: "80%" }}
          />
        );

      default:
        return (
          <InputText
            value={options.value || ""}
            onChange={(e) => options.editorCallback(e.target.value)}
            {...commonProps}
          />
        );
    }
  };

  const rowEditorValidator = (rowData: T) => {
    const rowErrors = validateRow(rowData);
    const key = (rowData[primaryKey] as string) ?? "";

    if (Object.keys(rowErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [key]: rowErrors }));
      setEditingRows((prev) => ({ ...prev, [key]: true }));
      return false;
    }

    // valid
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    setTableData((prev) =>
      prev.map((item) => ((item[primaryKey] as string) === key ? rowData : item))
    );

    setEditingRows((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    return true;
  };

  const actionBodyTemplate = (rowData: T) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-sm p-button-rounded p-button-outlined p-button-info"
      style={{ width: "25px", height: "25px", padding: "0" }}
      onClick={() => onEdit?.(rowData)}
    />
  );

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

        if (onDelete) onDelete(selectedRows);
        setTableData(remainingRows);
      },
    });
  };

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

  return (
    <div className="card p-3 h-[calc(100vh-100px)]">
      {/* Removed overflow-auto 🟢 */}

      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          {isNew && (
            <Button label="Add" icon="pi pi-plus" outlined onClick={addRow} size="small" className="p-button-sm custom-xs" />
          )}
          {isSave && (
            <Button label="Save" icon="pi pi-save" onClick={saveAll} size="small" className="p-button-sm custom-xs" />
          )}
          {isDelete && selectedRows.length > 0 && (
            <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              onClick={handleDelete}
              size="small"
              className="p-button-sm custom-xs"
            />
          )}
        </div>

        <div className="ml-auto">
          <span className="p-input-icon-left relative w-64">
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setFilters((prev: any) => ({
                    ...prev,
                    global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
                  }));
                }}
                placeholder="Search"
              />
            </IconField>
          </span>
        </div>
      </div>

      <ConfirmDialog />

      <DataTable
        value={tableData}
        dataKey={primaryKey as string}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        selectionMode="checkbox"
        editMode="row"
        editingRows={editingRows}
        onRowEditChange={(e) => setEditingRows(e.data)}
        rowEditValidator={rowEditorValidator}
        frozenWidth="250px"
        size="small"
        scrollable
        style={{ width: "100%" }}
        rowClassName={(rowData, rowIndex: any) =>
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }
        filters={filters}
        globalFilterFields={columns.map((c) => c.field as string)}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowEditCancel={(e: DataTableRowEditEvent) => discardRow(e.data)}
        paginatorTemplate={
          isMobile
            ? "PrevPageLink NextPageLink CurrentPageReport"
            : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        }
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} frozen />

        <Column
          header="No."
          body={(_, options) => options.rowIndex + 1}
          style={{ width: "40px", minWidth: "40px" }}
          frozen
        />

        {columns
          .filter((col) => !col.hidden)
          .map((col) => (
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

        <Column body={actionBodyTemplate} header="Actions" style={{ width: "100px" }} frozen={true} alignFrozen="right" />
      </DataTable>
    </div>
  );
}
