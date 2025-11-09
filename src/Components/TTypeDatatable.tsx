import React, { useState } from "react";
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
import { classNames } from "primereact/utils";
import { InputNumber } from "primereact/inputnumber";
import { TTypeDatatableProps } from "../models/component/TTypedDatatableProps";
import { ColumnMeta } from "../models/component/ColumnMeta";

export function TTypeDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
}: TTypeDatatableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});

  const getNextPrimaryKey = (): string => {
    const maxId = Math.max(
      0,
      ...tableData.map((item) => Number(item[primaryKey]) || 0)
    );
    return (maxId + 1).toString();
  };

  const addRow = () => {
    // ✅ Check if any row is already open for editing
    if (Object.keys(editingRows).length > 0) {
      return;
    }

    const newRow = {} as T;
    columns.forEach((col) => {
      if (col.type === "checkbox") (newRow[col.field] as any) = false;
      else (newRow[col.field] as any) = "";
    });
    (newRow[primaryKey] as any) = getNextPrimaryKey();

    const newData = [...tableData, newRow];
    setTableData(newData);

    const newKey = newRow[primaryKey] as string;
    setEditingRows({ [newKey]: true }); // ✅ open only this row
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

    const commonProps = {
      className: classNames({ "p-invalid border-red-500": !!fieldError }),
      style: { width: "100%" },
    };

    switch (col.type) {
      case "select":
        return (
          <div className="flex flex-col">
            <Dropdown
              value={options.value}
              options={col.options || []}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => options.editorCallback(e.value)}
              {...commonProps}
            />
            {fieldError && (
              <small className="p-error text-xs mt-1">{fieldError}</small>
            )}
          </div>
        );

      case "date":
        return (
          <div className="flex flex-col">
            <Calendar
              value={options.value ? new Date(options.value) : null}
              onChange={(e) => options.editorCallback(e.value)}
              dateFormat="yy-mm-dd"
              {...commonProps}
            />
            {fieldError && (
              <small className="p-error text-xs mt-1">{fieldError}</small>
            )}
          </div>
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
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              onValueChange={(e) => options.editorCallback(e.value)}
              mode="currency"
              currency="INR"
              locale="en-IN"
              style={{ width: "40%" }}
            />
            {fieldError && <small className="p-error">{fieldError}</small>}
          </div>
        );

      case "decimal":
        return (
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              onValueChange={(e) => options.editorCallback(e.value)}
              mode="decimal"  // ✅ plain number
              minFractionDigits={0}
              maxFractionDigits={2}
              style={{ width: "40%" }}
            />
            {fieldError && <small className="p-error">{fieldError}</small>}
          </div>
        );

      case "gst":
        return (
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              onValueChange={(e) =>
                handleValueChange(e.value, { ...options, field: col.field }, col)
              }
              mode="decimal"           // ✅ ensures number mode
              minFractionDigits={0}    // ✅ optional
              maxFractionDigits={2}    // ✅ up to 2 decimal places
              useGrouping={false}      // ✅ avoids commas (e.g., 1,000)
              style={{ width: "80%" }}
            />
            {fieldError && <small className="p-error">{fieldError}</small>}
          </div>
        )

      default:
        return (
          <div className="flex flex-col">
            <InputText
              value={options.value || ""}
              onChange={(e) => options.editorCallback(e.target.value)}
              {...commonProps}
            />
            {fieldError && (
              <small className="p-error text-xs mt-1">{fieldError}</small>
            )}
          </div>
        );
    }
  };

  const rowEditorValidator = (rowData: T) => {
    const rowErrors = validateRow(rowData);
    const key = (rowData[primaryKey] as string) ?? "";

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
      prev.map((item) => ((item[primaryKey] as string) === key ? rowData : item))
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

  return (
    <div className="card">
      <div className="flex justify-end gap-2 mb-3">
        <Button
          label="Add"
          icon="pi pi-plus"
          outlined
          onClick={addRow}
        />
        <Button
          label="Save"
          icon="pi pi-save"
          severity="success"
          onClick={saveAll}
        />
      </div>

      <DataTable
        value={tableData}
        dataKey={primaryKey as string}
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
      >
        {columns.map((col) => (
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

        <Column
          rowEditor
          headerStyle={{ width: "5rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </DataTable>
    </div >
  );
}
