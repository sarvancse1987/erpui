import React, { useEffect, useState } from "react";
import { DataTable, DataTableRowEditEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { RadioButton } from "primereact/radiobutton";
import { classNames } from "primereact/utils";
import { ColumnMeta } from "../models/component/ColumnMeta";
import { TTypedDatatableProps } from "../models/component/TTypedDatatableProps";
import { FilterMatchMode } from "primereact/api";

interface Product {
  productId: number;
  productName: string;
  unitPrice: number;
}

export function TTypedDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
  onSave,
  onDelete,
  products = [] as Product[], // pass products as a prop
}: TTypedDatatableProps<T> & { products?: Product[] }) {
  const [tableData, setTableData] = useState<T[]>([]);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState<any>({});

  // For Product search per row
  const [showTableMap, setShowTableMap] = useState<{ [key: string]: boolean }>({});
  const [searchTextMap, setSearchTextMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setTableData(data.map((d) => ({ ...d })));
  }, [data]);

  useEffect(() => {
    const f: any = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
    columns.forEach((c) => f[c.field] = { value: null, matchMode: FilterMatchMode.CONTAINS });
    setFilters(f);
  }, [columns]);

  const addRow = () => {
    if (Object.keys(editingRows).length > 0) return;
    const newRow = columns.reduce((acc, col) => {
      acc[col.field as string] = col.type === "checkbox" ? false : "";
      return acc;
    }, {} as Record<string, any>) as T;

    (newRow[primaryKey] as any) = 0;
    (newRow as any)._tempKey = `temp-${Date.now()}-${Math.random()}`;
    (newRow as any)._edited = true;

    setTableData((prev) => [{ ...newRow }, ...prev]);
    setEditingRows((prev) => ({ ...prev, [newRow._tempKey]: true }));
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

  const markRowEdited = (updatedRow: T) => {
    const key = (updatedRow as any)._tempKey || updatedRow[primaryKey];
    setTableData((prev) =>
      prev.map((r) =>
        (r._tempKey || r[primaryKey]) === key ? { ...r, ...updatedRow, _edited: true } : r
      )
    );
  };

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
              dateFormat="dd-mm-yy"
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
      case "decimal":
      case "gst":
      // return (
      //   <div className="flex flex-col">
      //     <InputNumber
      //       value={options.value}
      //       onValueChange={(e) => updateValue(e.value)}
      //       mode={col.type === "decimal" ? "decimal" : "currency"}
      //       currency={col.type === "gst" ? "INR" : undefined}
      //       locale="en-IN"
      //       minFractionDigits={col.type === "decimal" ? 0 : undefined}
      //       maxFractionDigits={col.type === "decimal" ? 2 : undefined}
      //       style={{ width: "80%" }}
      //     />
      //     {fieldError && <small className="p-error text-xs mt-1">{fieldError}</small>}
      //   </div>
      // );
      case "currency":
        let inputMode: "decimal" | "currency" = "decimal";
        let inputCurrency: string | undefined = undefined;
        let minFrac: number | undefined = undefined;
        let maxFrac: number | undefined = undefined;

        if (col.type === "currency") {
          inputMode = "currency";
          inputCurrency = "INR";
        } else if (col.type === "decimal" || col.type === "gst") {
          inputMode = "decimal";
          minFrac = 0;
          maxFrac = 2;
        } else {
          inputMode = "decimal"; // number
        }

        return (
          <div className="flex flex-col">
            <InputNumber
              value={options.value}
              onValueChange={(e) => updateValue(e.value)}
              mode={inputMode}
              currency={inputCurrency}
              locale="en-IN"
              minFractionDigits={minFrac}
              maxFractionDigits={maxFrac}
              style={{ width: "80%" }}
            />
            {fieldError && <small className="p-error text-xs mt-1">{fieldError}</small>}
          </div>
        );
      case "productSearch":
        const filteredProducts = products.filter((p) =>
          p.productName.toLowerCase().includes((searchTextMap[key] || "").toLowerCase())
        );
        return (
          <div className="relative w-full">
            <InputText
              className="w-full"
              value={options.value?.productName || ""}
              placeholder="Search Item"
              onChange={(e) => {
                const val = e.target.value;
                setSearchTextMap((prev) => ({ ...prev, [key]: val }));
                setShowTableMap((prev) => ({ ...prev, [key]: val.trim() !== "" }));
              }}
              onFocus={() => setShowTableMap((prev) => ({ ...prev, [key]: true }))}
            />
            {showTableMap[key] && (
              <>
                <div className="fixed inset-0 bg-black opacity-20" onClick={() => setShowTableMap((prev) => ({ ...prev, [key]: false }))} />
                <div className="absolute z-30 w-full max-h-64 overflow-auto bg-white border shadow-lg">
                  <DataTable
                    value={filteredProducts}
                    size="small"
                    responsiveLayout="scroll"
                    showHeaders
                    scrollable
                  >
                    <Column header="Select" body={(row) => (
                      <RadioButton
                        value={row.productId}
                        onChange={() => {
                          options.editorCallback(row);
                          markRowEdited({ ...options.rowData, productId: row.productId, productName: row.productName });
                          setShowTableMap((prev) => ({ ...prev, [key]: false }));
                        }}
                        checked={options.value?.productId === row.productId}
                      />
                    )} style={{ width: "60px" }} />
                    <Column field="productName" header="Item Name" style={{ minWidth: "200px" }} />
                    <Column field="unitPrice" header="Rate" style={{ minWidth: "120px" }} />
                  </DataTable>
                </div>
              </>
            )}
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
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 mb-3 flex-none">
          <Button label="Add" icon="pi pi-plus" outlined onClick={addRow} />
          <Button label="Save" icon="pi pi-save" severity="success" onClick={saveAll} disabled={!isSaveEnabled} />
          <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={deleteSelected} disabled={!selectedRows.length} />
        </div>
        <div className="ml-auto">
          <span className="p-input-icon-left relative w-64">
            <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <InputText
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setFilters((prev: any) => ({ ...prev, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } }));
              }}
              placeholder="Search..."
              className="pl-10 w-full"
            />
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          value={tableData}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          dataKey={(rowData) => rowData._tempKey || rowData[primaryKey]}
          editMode="row"
          editingRows={editingRows}
          onRowEditChange={(e: DataTableRowEditEvent) => setEditingRows(e.data)}
          filters={filters}
          globalFilterFields={columns.map((c) => c.field as string)}
          size="small"
          scrollable
          selection={selectedRows}
          onSelectionChange={(e) => setSelectedRows(e.value)}
          rowClassName={(options) => (options.index % 2 === 0 ? "bg-gray-50" : "bg-white")}
          emptyMessage="No records found."
          scrollHeight="100%"
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column header="Sr. No." body={(_, options) => options.rowIndex + 1} style={{ width: "70px", minWidth: "70px" }} />
          {columns.filter((col) => !col.hidden).map((col) => (
            <Column
              key={String(col.field)}
              field={col.field as string}
              header={<>{col.header}{col.required && <span className="text-red-500">*</span>}</>}
              filter
              showFilterMenu={false}
              filterPlaceholder={`Search ${col.header}`}
              editor={col.editable ? (options) => cellEditor(options, col) : undefined}
              body={col.body ? (r: T) => col.body!(r) : undefined}
              style={{ width: col.width || "auto", minWidth: col.width || "120px" }}
            />
          ))}
          <Column rowEditor headerStyle={{ width: "5rem" }} bodyStyle={{ textAlign: "center" }} />
        </DataTable>
      </div>
    </div>
  );
}
