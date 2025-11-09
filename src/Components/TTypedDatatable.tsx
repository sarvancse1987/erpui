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
}: TTypedDatatableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const addRow = () => {
    if (Object.keys(editingRows).length > 0) return;

    const newRow = {} as T;
    columns.forEach((col) => {
      if (col.type === "checkbox") (newRow[col.field] as any) = false;
      else (newRow[col.field] as any) = "";
    });

    (newRow[primaryKey] as any) = 0; // new record primary key
    const tempKey = `temp-${Date.now()}-${Math.random()}`;
    (newRow as any)._tempKey = tempKey;

    setTableData([...tableData, newRow]);
    setEditingRows({ [tempKey]: true });
  };

  const validateRow = (rowData: T) => {
    const rowErrors: { [key: string]: string } = {};
    columns.forEach((col) => {
      if (col.required && (rowData[col.field] === "" || rowData[col.field] == null)) {
        rowErrors[col.field as string] = `${col.header} is required`;
      }
    });
    return rowErrors;
  };

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

        if (isNew || isEdited) changedRows.push(row);
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

  const markRowEdited = (row: T) => {
    (row as any)._edited = true;
    setTableData([...tableData]);
  };

  const cellEditor = (options: any, col: ColumnMeta<T>) => {
    const rowId = options.rowData[primaryKey] as string;
    const fieldError = errors[rowId]?.[col.field as string];
    const commonProps = { className: classNames({ "p-invalid border-red-500": !!fieldError }), style: { width: "100%" } };

    switch (col.type) {
      case "select":
        return (
          <div className="flex flex-col">
            <Dropdown
              value={options.value}
              options={col.options || []}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => {
                options.editorCallback(e.value);
                markRowEdited(options.rowData);
              }}
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
              onChange={(e) => {
                options.editorCallback(e.value);
                markRowEdited(options.rowData);
              }}
              dateFormat="yy-mm-dd"
              {...commonProps}
            />
            {fieldError && <small className="p-error text-xs mt-1">{fieldError}</small>}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex justify-center items-center h-full">
            <Checkbox
              checked={!!options.value}
              onChange={(e) => {
                options.editorCallback(e.checked);
                markRowEdited(options.rowData);
              }}
            />
          </div>
        );

      case "number":
        return (
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              onValueChange={(e) => {
                options.editorCallback(e.value);
                markRowEdited(options.rowData);
              }}
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
              onValueChange={(e) => {
                options.editorCallback(e.value);
                markRowEdited(options.rowData);
              }}
              mode="decimal"
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
              mode="currency"
              currency="INR"
              locale="en-IN"
              style={{ width: "80%" }}
              onValueChange={(e) => {
                options.editorCallback(e.value);
                const row: any = options.rowData as T;
                row[options.column.field] = e.value;
                updateGSTPrice(row);
                markRowEdited(row);
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
              onChange={(e) => {
                options.editorCallback(e.target.value);
                markRowEdited(options.rowData);
              }}
              {...commonProps}
            />
            {fieldError && <small className="p-error text-xs mt-1">{fieldError}</small>}
          </div>
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

  return (
    <div className="card">
      <div className="flex justify-end gap-2 mb-3">
        <Button label="Add" icon="pi pi-plus" outlined onClick={addRow} />
        <Button label="Save" icon="pi pi-save" severity="success" onClick={saveAll} />
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
        rowClassName={(rowData, rowIndex: any) =>
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }
      >
        <Column
          header="Sr. No."
          body={(rowData, options) => options.rowIndex + 1}
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
                  {col.header}{" "}
                  {col.required && <span className="required-asterisk">*</span>}
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

        <Column rowEditor headerStyle={{ width: "5rem" }} bodyStyle={{ textAlign: "center" }} />
      </DataTable>
    </div>
  );
}
