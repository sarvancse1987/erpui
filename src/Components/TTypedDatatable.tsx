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
  isDelete,
  onEdit,
  onDelete,
  onSave
}: TTypeDatatableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingRowData, setEditingRowData] = useState<T | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

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
    setTableData((prev) => [...prev, newRow]);

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

    tableData.forEach((row) => {
      const rowErrors = validateRow(row);
      if (Object.keys(rowErrors).length > 0) {
        const key = row[primaryKey] as string;
        allErrors[key] = rowErrors;
        rowsToReopen[key] = true; // ✅ reopen invalid rows
        valid = false;
      }
    });

    if (!valid) {
      setErrors(allErrors);
      setEditingRows(rowsToReopen); // ✅ keep those rows open
      return;
    }

    console.log("✅ Saved Data:", tableData);
    setErrors({});
    setEditingRows({});

    if (tableData && tableData.length > 0 && onSave) {
      onSave(tableData);
    }
  };

  const handleValueChange = (value: any, options: any, col: ColumnMeta<T>) => {
    const field = (options?.column?.field || options?.field) as keyof T;

    if (!field) {
      console.warn("⚠️ Missing field in handleValueChange", options);
      return;
    }

    const rowData = options.rowData as T;

    const updatedTable = tableData.map((r) => {
      if ((r as any).id === (rowData as any).id) {
        let updatedRow = { ...r, [field]: value };

        // ✅ Run custom logic (e.g., recalculate GST)
        if (col.onValueChange) {
          col.onValueChange(updatedRow, value, tableData, (newTable) => {
            // if the custom handler wants to override the whole table
            setTableData(newTable);
          });
        }

        return updatedRow;
      }
      return r;
    });

    // ✅ Update React state with the newly computed row
    setTableData(updatedTable);

    // ✅ Sync PrimeReact’s internal value
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
        return (
          <InputNumber
            value={options.value}
            onValueChange={(e) => options.editorCallback(e.value)}
            mode="decimal"  // ✅ plain number
            minFractionDigits={0}
            maxFractionDigits={2}
            {...commonProps}
          />
        );

      case "gst":
        return (
          <InputNumber
            value={options.value}
            onValueChange={(e) =>
              handleValueChange(e.value, { ...options, field: col.field }, col)
            }
            mode="decimal"           // ✅ ensures number mode
            minFractionDigits={0}    // ✅ optional
            maxFractionDigits={2}    // ✅ up to 2 decimal places
            useGrouping={false}
            {...commonProps}
          />
        )

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
    const key = (rowData as any)._tempKey || (rowData[primaryKey] as string);

    if (Object.keys(rowErrors).length > 0) {
      // Keep row open
      setErrors((prev) => ({ ...prev, [key]: rowErrors }));
      setEditingRows((prev) => ({ ...prev, [key]: true }));
      return false; // ❌ row not saved
    }

    // ✅ row valid, remove errors
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    // Update tableData
    setTableData((prev) =>
      prev.map((item) =>
        ((item as any)._tempKey || item[primaryKey]) === key ? rowData : item
      )
    );

    // Close the editing row
    setEditingRows((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    return true;
  };


  const updateGSTPrice = (rowData: any) => {
    if (rowData["isGSTIncludedInPrice"]) {
      const purchase = Number(rowData["purchasePrice"] || 0);
      const cgst = Number(rowData["cgstRate"] || 0);
      const sgst = Number(rowData["sgstRate"] || 0);

      // GST calculation
      rowData["gstPrice"] = purchase + (purchase * (cgst + sgst)) / 100;
    } else {
      rowData["gstPrice"] = Number(rowData["purchasePrice"] || 0);
    }
  };

  const openEditDialog = (rowData: T) => {
    setEditingRowData({ ...rowData });
    setEditDialogVisible(true);
  };

  const actionBodyTemplate = (rowData: T) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-sm p-button-rounded p-button-outlined p-button-info"
      style={{ width: '25px', height: '25px', padding: '0' }}
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

        // send deleted rows to parent
        if (onDelete) {
          onDelete(selectedRows);
        }

        setTableData(remainingRows);
      }
    });
  };


  return (
    <div className="card p-3 h-[calc(100vh-100px)] overflow-auto">

      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          {isNew && <Button label="Add" icon="pi pi-plus" outlined onClick={addRow} />}
          {isSave && <Button label="Save" icon="pi pi-save" severity="success" onClick={saveAll} />}
          {isDelete && selectedRows.length > 0 && (
            <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              outlined
              onClick={() => handleDelete()}
            />
          )}
        </div>

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
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          header="Sr. No."
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
          />
        ))}

        {/* <Column body={actionBodyTemplate} header="Actions" style={{ width: "100px" }} /> */}
        <Column rowEditor headerStyle={{ width: "5rem" }} bodyStyle={{ textAlign: "center" }} />
      </DataTable>
    </div >
  );
}
