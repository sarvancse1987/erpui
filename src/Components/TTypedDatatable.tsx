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
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { InputNumber } from "primereact/inputnumber";
import { ColumnMeta } from "../models/component/ColumnMeta";
import { TTypedDatatableProps } from "../models/component/TTypedDatatableProps";

export function TTypedDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
  onSave,
  onDelete,
}: TTypedDatatableProps<T>) {
  const [tableData, setTableData] = useState<T[]>([]);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  useEffect(() => {
    setTableData(data.map((d) => ({ ...d }))); // clone initial data
  }, [data]);

  // ✅ Properly clone structure when adding
  const addRow = () => {
    if (Object.keys(editingRows).length > 0) return;

    const newRow = columns.reduce((acc, col) => {
      if (col.type === "checkbox") acc[col.field as string] = false;
      else acc[col.field as string] = "";
      return acc;
    }, {} as Record<string, any>) as T;

    (newRow[primaryKey] as any) = 0;
    (newRow as any)._tempKey = `temp-${Date.now()}-${Math.random()}`;
    (newRow as any)._edited = true;

    setTableData((prev) => [...prev, { ...newRow }]); // clone to prevent shared ref
    setEditingRows((prev) => ({ ...prev, [newRow._tempKey]: true }));
  };

  // ✅ Row validation
  const validateRow = (rowData: T) => {
    const rowErrors: { [key: string]: string } = {};
    columns.forEach((col) => {
      if (col.required && (rowData[col.field] === "" || rowData[col.field] == null)) {
        rowErrors[col.field as string] = `${col.header} is required`;
      }
    });
    return rowErrors;
  };

  // ✅ Save all logic
  const saveAll = () => {
    let valid = true;
    const allErrors: typeof errors = {};
    const rowsToReopen: { [key: string]: boolean } = {};
    const changedRows: T[] = [];

    tableData.forEach((row) => {
      const rowErrors = validateRow(row);
      const key = (row as any)._tempKey || row[primaryKey];

      if (Object.keys(rowErrors).length > 0) {
        allErrors[key] = rowErrors;
        rowsToReopen[key] = true;
        valid = false;
      } else {
        const isNew = row[primaryKey] === 0;
        const isEdited = !!row._edited;
        if (isNew || isEdited) changedRows.push({ ...row });
      }
    });

    if (!valid) {
      setErrors(allErrors);
      setEditingRows(rowsToReopen);
      return;
    }

    setErrors({});
    setEditingRows({});
    if (onSave && changedRows.length > 0) onSave(changedRows);
  };

  // ✅ Properly mark row edited (without reference overwrite)
  const markRowEdited = (updatedRow: T) => {
    const key = (updatedRow as any)._tempKey || updatedRow[primaryKey];
    setTableData((prev) =>
      prev.map((r) =>
        (r._tempKey || r[primaryKey]) === key ? { ...r, ...updatedRow, _edited: true } : r
      )
    );
  };

  // ✅ Cell editor
  const cellEditor = (options: any, col: ColumnMeta<T>) => {
    const key = options.rowData._tempKey || options.rowData[primaryKey];
    const fieldError = errors[key]?.[col.field as string];
    const commonProps = {
      className: classNames({ "p-invalid border-red-500": !!fieldError }),
      style: { width: "100%" },
    };

    const updateValue = (value: any) => {
      const updatedRow = { ...options.rowData, [col.field]: value };
      options.editorCallback(value);
      markRowEdited(updatedRow);
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
              onChange={(e) => updateValue(e.value)}
              {...commonProps}
            />
            {fieldError && <small className="p-error text-xs mt-1">{fieldError}</small>}
          </div>
        );

      case "date":
        return (
          <div className="flex flex-col">
            <Calendar
              value={options.value ? new Date(options.value) : null}
              onChange={(e) => updateValue(e.value)}
              dateFormat="yy-mm-dd"
              {...commonProps}
            />
            {fieldError && <small className="p-error text-xs mt-1">{fieldError}</small>}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex justify-center items-center h-full">
            <Checkbox checked={!!options.value} onChange={(e) => updateValue(e.checked)} />
          </div>
        );

      case "number":
        return (
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              onValueChange={(e) => updateValue(e.value)}
              mode="currency"
              currency="INR"
              locale="en-IN"
              style={{ width: "80%" }}
            />
            {fieldError && <small className="p-error">{fieldError}</small>}
          </div>
        );

      case "decimal":
        return (
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              onValueChange={(e) => updateValue(e.value)}
              mode="decimal"
              minFractionDigits={0}
              maxFractionDigits={2}
              style={{ width: "80%" }}
            />
            {fieldError && <small className="p-error">{fieldError}</small>}
          </div>
        );

      case "gst":
        return (
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              mode="currency"
              currency="INR"
              locale="en-IN"
              style={{ width: "80%" }}
              onValueChange={(e) => {
                const updatedRow = { ...options.rowData, [col.field]: e.value };
                updateGSTPrice(updatedRow);
                updateValue(e.value);
              }}
            />
            {fieldError && <small className="p-error">{fieldError}</small>}
          </div>
        );

      default:
        return (
          <div className="flex flex-col">
            <InputText
              value={options.value || ""}
              onChange={(e) => updateValue(e.target.value)}
              {...commonProps}
            />
            {fieldError && <small className="p-error text-xs mt-1">{fieldError}</small>}
          </div>
        );
    }
  };

  // ✅ Row editor validation
  const rowEditorValidator = (rowData: T) => {
    const rowErrors = validateRow(rowData);
    const key = (rowData[primaryKey] as string) ?? "";

    if (Object.keys(rowErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [key]: rowErrors }));
      setEditingRows((prev) => ({ ...prev, [key]: true }));
      return false;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    markRowEdited(rowData);
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
      rowData["gstPrice"] = purchase + (purchase * (cgst + sgst)) / 100;
    } else {
      rowData["gstPrice"] = Number(rowData["purchasePrice"] || 0);
    }
  };

  const deleteSelected = () => {
    if (!selectedRows.length) return;
    const selectedIds = selectedRows.map((r) => r[primaryKey]);
    const remaining = tableData.filter((r) => !selectedIds.includes(r[primaryKey]));
    setTableData(remaining);
    setSelectedRows([]);
    if (onDelete) onDelete(selectedRows);
  };

  const isSaveEnabled = tableData.some((r) => r[primaryKey] === 0 || !!r._edited);

  return (
    <div className="card p-3 h-[calc(100vh-100px)] overflow-auto">
      <div className="flex justify-end gap-2 mb-3">
        <Button label="Add" icon="pi pi-plus" outlined onClick={addRow} />
        <Button
          label="Save"
          icon="pi pi-save"
          severity="success"
          onClick={saveAll}
          disabled={!isSaveEnabled}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={deleteSelected}
          disabled={!selectedRows.length}
        />
      </div>

      <DataTable
        value={tableData}
        dataKey={(rowData) => rowData._tempKey || rowData[primaryKey]}
        editMode="row"
        editingRows={editingRows}
        onRowEditChange={(e: DataTableRowEditEvent) => setEditingRows(e.data)}
        rowEditValidator={rowEditorValidator}
        size="small"
        scrollable
        style={{ width: "100%" }}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        rowClassName={(options) => (options.index % 2 === 0 ? "bg-gray-50" : "bg-white")}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        <Column
          header="Sr. No."
          body={(_, options) => options.rowIndex + 1}
          style={{ width: "70px", minWidth: "70px" }}
        />

        {columns
          .filter((col) => !col.hidden)
          .map((col) => (
            <Column
              key={String(col.field)}
              field={col.field as string}
              header={
                <>
                  {col.header}
                  {col.required && <span className="text-red-500">*</span>}
                </>
              }
              editor={col.editable ? (options) => cellEditor(options, col) : undefined}
              body={col.body ? (r: T) => col.body!(r) : undefined}
              style={{ width: col.width || "auto", minWidth: col.width || "120px" }}
            />
          ))}

        <Column rowEditor headerStyle={{ width: "5rem" }} bodyStyle={{ textAlign: "center" }} />
      </DataTable>
    </div>
  );
}
