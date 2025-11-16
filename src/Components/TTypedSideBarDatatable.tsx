import React, { useEffect, useState } from "react";
import { DataTable, DataTableRowEditEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { classNames } from "primereact/utils";
import { ColumnMeta } from "../models/component/ColumnMeta";
import { TTypedDatatableProps } from "../models/component/TTypedDatatableProps";
import { FilterMatchMode } from "primereact/api";
import { Sidebar } from "primereact/sidebar";
import { ProductModel, ProductSearchModel } from "../models/product/ProductModel";
import { Paginator } from "primereact/paginator";

export function TTypedSideBarDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
  isSave,
  onSave,
  onDelete,
  itemsSaveTrigger,
  products = [] as ProductModel[], // pass products as a prop
}: TTypedDatatableProps<T> & { products?: ProductModel[] }) {
  const [tableData, setTableData] = useState<T[]>([]);
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [rowId: string]: { [field: string]: string } }>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState<any>({});

  // For Product search per row
  const [showTableMap, setShowTableMap] = useState<{ [key: string]: boolean }>({});

  // Sidebar for product selection
  const [productSidebarVisible, setProductSidebarVisible] = useState(false);
  const [sidebarRowKey, setSidebarRowKey] = useState<string | number | null>(null);
  const [sidebarSelectedProducts, setSidebarSelectedProducts] = useState<ProductModel[]>([]);
  const [sidebarSearchText, setSidebarSearchText] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    setTableData(data.map((d) => ({ ...d })));
  }, [data]);

  useEffect(() => {
    const f: any = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
    columns.forEach((c) => f[c.field] = { value: null, matchMode: FilterMatchMode.CONTAINS });
    setFilters(f);
  }, [columns]);

  useEffect(() => {
    if (!itemsSaveTrigger) return;
    saveAll(); // <-- RUN CHILD VALIDATION
  }, [itemsSaveTrigger]);

  const addRow = () => {
    if (Object.keys(editingRows).length > 0) return;

    const rowKey = `temp-${Date.now()}-${Math.random()}`;

    // Open sidebar for product selection
    setSidebarRowKey(rowKey);
    setProductSidebarVisible(true);
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

  const markRowEdited = (updatedRow: any) => {
    const key = (updatedRow as any)._tempKey || updatedRow[primaryKey];

    // Calculate total
    const unitPrice = parseFloat(updatedRow.unitPrice) || 0;
    const quantity = parseFloat(updatedRow.quantity) || 0;
    const total = parseFloat((unitPrice * quantity).toFixed(2));

    // Calculate GST
    const gstRate = parseFloat(updatedRow.gstRate) || 0;
    const gstAmount = parseFloat(((total * gstRate) / 100).toFixed(2));

    // Calculate Grand Total
    const grandTotal = parseFloat((total + gstAmount).toFixed(2));

    updatedRow.total = total;
    updatedRow.gstAmount = gstAmount;
    updatedRow.grandTotal = grandTotal;

    setTableData((prev) =>
      prev.map((r) =>
        (r._tempKey || r[primaryKey]) === key
          ? { ...r, ...updatedRow, _edited: true }
          : r
      )
    );
  };

  const cellEditor = (options: any, col: ColumnMeta<T>) => {
    const key = options.rowData._tempKey || options.rowData[primaryKey];
    const fieldError = errors[key]?.[col.field as string];
    const commonProps = {
      className: classNames({ "mandatory-border": !!fieldError }),
      style: { width: "100%" },
    };

    const updateValue = (value: any) => {
      const updatedRow = { ...options.rowData, [col.field]: value };
      options.editorCallback(value);
      markRowEdited(updatedRow);
    };

    switch (col.type) {
      case "inputdisabled":
        return (
          <div className={classNames("flex flex-col", { "mandatory-border": !!fieldError })}>
            <InputText
              value={options.value || ""} disabled
              {...commonProps}
            />
          </div>
        );
      case "select":
        return (
          <div className={classNames("flex flex-col", { "mandatory-border": !!fieldError })}>
            <Dropdown
              value={options.value}
              options={col.options || []}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => updateValue(e.value)}
              {...commonProps}
            />
          </div>
        );
      case "selectsearch":
        return (
          <div className={classNames("flex flex-col", { "mandatory-border": !!fieldError })}>
            <Dropdown
              value={options.value}
              options={col.options || []}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => updateValue(e.value)}
              filter                  // <-- enables search
              filterBy="label"        // <-- search based on label field
              showClear               // <-- optional, allow clearing selection
              {...commonProps}
            />
          </div>
        );
      case "date":
        return (
          <div className={classNames("flex flex-col", { "mandatory-border": !!fieldError })}>
            <Calendar
              value={options.value ? new Date(options.value) : null}
              onChange={(e) => updateValue(e.value)}
              dateFormat="dd-mm-yy"
              {...commonProps}
            />
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
      case "currency":
        let inputMode: "decimal" | "currency" = "decimal";
        let inputCurrency: string | undefined = undefined;
        let minFrac: number | undefined = undefined;
        let maxFrac: number | undefined = undefined;

        if (col.type === "currency") {
          inputMode = "currency";
          inputCurrency = "INR";
        } else if (col.type === "decimal") {
          inputMode = "decimal";
          minFrac = 0;
          maxFrac = 2;
        }

        return (
          <div className={classNames("flex flex-col", { "mandatory-border": !!fieldError })}>
            <InputNumber
              value={options.value}
              onValueChange={(e) => {
                const updatedRow = { ...options.rowData, [col.field]: e.value };

                // Auto-calculate total if unitPrice or quantity changes
                if (col.field === "unitPrice" || col.field === "quantity") {
                  const unitPrice = parseFloat(updatedRow.unitPrice) || 0;
                  const quantity = parseFloat(updatedRow.quantity) || 0;
                  updatedRow.total = parseFloat((unitPrice * quantity).toFixed(2));

                  const gstRate = parseFloat(updatedRow.gstRate) || 0;
                  updatedRow.gstAmount = parseFloat(((updatedRow.total * gstRate) / 100).toFixed(2));
                }

                // Auto-calculate GST if gstRate changes
                if (col.field === "gstRate") {
                  const total = parseFloat(updatedRow.total) || 0;
                  const gstRate = parseFloat(updatedRow.gstRate) || 0;
                  updatedRow.gstAmount = parseFloat(((total * gstRate) / 100).toFixed(2));
                }

                options.editorCallback(e.value);
                markRowEdited(updatedRow);
              }}
              mode={inputMode}
              currency={inputCurrency}
              locale="en-IN"
              minFractionDigits={minFrac}
              maxFractionDigits={maxFrac}
              style={{ width: "80%" }}
            />
            {errors[options.rowData._tempKey || options.rowData[primaryKey]]?.[col.field as string] && (
              <small className="p-error text-xs mt-1">
                {errors[options.rowData._tempKey || options.rowData[primaryKey]][col.field as string]}
              </small>
            )}
          </div>
        );
      case "gst":
        return (
          <InputText
            className={classNames("flex flex-col", { "mandatory-border": !!fieldError })}
            value={options.value || ""}
            onChange={(e) => {
              const val = e.target.value;

              if (val === "" || /^[0-9]*\.?[0-9]{0,3}$/.test(val)) {
                const updatedRow = { ...options.rowData, gstRate: val };

                // calculate GST Amount
                const total = parseFloat(updatedRow.total) || 0;
                const gstRate = parseFloat(val) || 0;
                updatedRow.gstAmount = parseFloat(((total * gstRate) / 100).toFixed(2));

                options.editorCallback(val);
                markRowEdited(updatedRow);
              }
            }}
          />
        );
      case "productSearch":
        return (
          <div className="relative w-full">
            <InputText
              className={classNames("w-full", { "p-invalid border-red-500": !!fieldError })}
              value={options.value || ""}
              placeholder="Search Item"
              readOnly={false}
              onClick={() => {
                if (!options.rowData.isNew) {
                  setProductSidebarVisible(true);
                  setSidebarRowKey(key);
                }
              }}
              onChange={(e) => {
                if (options.rowData.isNew) {
                  const val = e.target.value;
                  options.editorCallback(val);
                  markRowEdited({ ...options.rowData, productName: val });
                }
              }}
              onFocus={() => {
                if (options.rowData.isNew) {
                  setShowTableMap((prev) => ({ ...prev, [key]: true }));
                }
              }}
            />
          </div>
        );
      case "textdisabled":
        return (
          <div className="flex flex-col">
            <InputText
              value={options.value || ""}
              onChange={(e) => updateValue(e.target.value)}
              {...commonProps}
              readOnly={true}
            />
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
        <div className="flex gap-2 mb-1 flex-none">
          <Button label="Add" icon="pi pi-plus" outlined onClick={addRow} />
          {isSave && < Button label="Save" icon="pi pi-save" severity="success" onClick={saveAll} disabled={!isSaveEnabled} />}
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
          paginator={false}
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
          onSelectionChange={(e: any) => setSelectedRows(e.value)}
          rowClassName={(options) => (options.index % 2 === 0 ? "bg-gray-50" : "bg-white")}
          emptyMessage="No records found."
          scrollHeight="100%"
          footer={
            <div className="custom-footer flex gap-4">
              {/* Total Amount */}
              <div
                className="flex items-center justify-center px-4 py-2 text-base font-semibold"
                style={{
                  background: "#0CA678",   // Modern Emerald Green
                  color: "white",
                  borderRadius: "0px",
                  minWidth: "180px",
                  textAlign: "center"
                }}
              >
                Total Amount: ₹
                {tableData.reduce((a, r) => a + (r.total || 0), 0).toFixed(2)}
              </div>

              {/* GST Amount */}
              <div
                className="flex items-center justify-center px-4 py-2 text-base font-semibold"
                style={{
                  background: "#F4B400",   // Modern Yellow
                  color: "black",
                  borderRadius: "0px",
                  minWidth: "180px",
                  textAlign: "center"
                }}
              >
                GST Amount: ₹
                {tableData.reduce((a, r) => a + (r.gstAmount || 0), 0).toFixed(2)}
              </div>

              {/* Grand Total */}
              <div
                className="flex items-center justify-center px-4 py-2 text-base font-semibold"
                style={{
                  background: "#3B82F6",   // Nice Blue
                  color: "white",
                  borderRadius: "0px",
                  minWidth: "180px",
                  textAlign: "center"
                }}
              >
                Grand Total: ₹
                {tableData.reduce((a, r) => a + (r.grandTotal || 0), 0).toFixed(2)}
              </div>
            </div>

          }
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

        <Paginator
          first={first}
          rows={rows}
          totalRecords={tableData.length}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(e) => {
            setFirst(e.first);
            setRows(e.rows);
          }}
          className="mt-3"
        />

        <Sidebar
          visible={productSidebarVisible}
          onHide={() => {
            setProductSidebarVisible(false);
            setSidebarSelectedProducts([]);
            setSidebarSearchText("");
          }}
          position="right"
          style={{ width: "500px" }}
          header="Select Products"
        >
          <InputText
            value={sidebarSearchText}
            onChange={(e) => setSidebarSearchText(e.target.value)}
            placeholder="Search Products"
            className="w-full mb-3"
          />

          <DataTable
            value={products.filter(p =>
              p.productName.toLowerCase().includes(sidebarSearchText.toLowerCase())
            )}
            selection={sidebarSelectedProducts}
            onSelectionChange={(e) => setSidebarSelectedProducts(e.value)}
            dataKey="productId"
            selectionMode="multiple"      // <-- ADD THIS
            scrollable
            scrollHeight="300px"
            size="small"
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            <Column field="productName" header="Item Name" style={{ minWidth: "200px" }} />
            <Column field="unitPrice" header="Rate" style={{ minWidth: "120px" }} />
          </DataTable>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              label="Add Selected"
              icon="pi pi-check"
              severity="success"
              onClick={() => {
                const newRows = sidebarSelectedProducts.map((p: ProductSearchModel) => {
                  const rowKey = `temp-${Date.now()}-${Math.random()}`;
                  return {
                    productId: p.productId,
                    productName: p.productName,
                    _tempKey: rowKey,
                    _edited: true,
                  } as unknown as T;
                });

                setTableData(prev => [...newRows, ...prev]);

                // Make the new rows editable immediately
                const newEditingRows = newRows.reduce((acc, row) => {
                  acc[(row as any)._tempKey] = true;
                  return acc;
                }, {} as { [key: string]: boolean });

                setEditingRows(newEditingRows);

                setSidebarSelectedProducts([]);
                setProductSidebarVisible(false);
              }}
            />
            <Button label="Cancel" icon="pi pi-times" outlined onClick={() => setProductSidebarVisible(false)} />
          </div>
        </Sidebar>
      </div>
    </div>
  );
}
