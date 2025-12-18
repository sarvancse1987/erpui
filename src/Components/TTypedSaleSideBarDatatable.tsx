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
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { CategoryModel } from "../models/product/CategoryModel";
import apiService from "../services/apiService";
import { MultiSelect } from "primereact/multiselect";
import { useToast } from "./ToastService";
import { storage } from "../services/storageService";
import SaleShipmentForm from "../modules/shipment/ShipmentForm";
import { ShipmentModel } from "../models/shipment/ShipmentModel";

export function TTypedSaleSideBarDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
  isSave,
  isDelete,
  onSave,
  onEdit,
  onDelete,
  itemsSaveTrigger,
  products = [] as ProductModel[],
  onChange,
  onAdjustmentsChange,
  savedAdjustments,
  onShipment,
  shipmentInfo
}: TTypedDatatableProps<T> & {
  products?: ProductModel[]
}) {
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
  const [selectedCategory, setSelectedCategory] = useState<number[] | null>(null);
  const [errorDropdown, setErrorDropdown] = useState(false);
  const [errorTextbox, setErrorTextbox] = useState(false);
  const [activeCategories, setActiveCategories] = useState<CategoryModel[]>([]);
  const { showSuccess, showError } = useToast();
  const [adjustmentOptions, setAdjustmentOptions] = useState<{ label: string; value: number }[]>([]);
  const [selectedAdjustment, setSelectedAdjustment] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustments, setAdjustments] = useState<Record<number, number | undefined>>({});
  const user = storage.getUser();
  const [showShipment, setShowShipment] = useState(false);
  const [shipmentModel, setShipmentModel] = useState<ShipmentModel | null>(null);

  const loadFreightData = async () => {
    try {
      const response = await apiService.get(`/Adjustments/${Number(user?.companyId)}/${Number(user?.locationId)}`);
      const typeOptions = (response ?? []).map((pt: any) => ({
        label: pt.adjustmentName,
        value: pt.adjustmentId
      }));
      setAdjustmentOptions(typeOptions);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    fetchCategories();
    loadFreightData();
  }, []);

  useEffect(() => {
    setTableData(data.map((d) => ({ ...d })));
  }, [data]);

  useEffect(() => {
    if (!shipmentInfo) return;
    setShipmentModel(prev => ({
      ...prev,
      ...shipmentInfo
    }));
  }, [shipmentInfo]);

  useEffect(() => {
    if (!savedAdjustments) return;

    setAdjustments(prev => ({
      ...prev,
      ...savedAdjustments,
    }));
  }, [savedAdjustments]);

  useEffect(() => {
    const f: any = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
    columns.forEach((c) => f[c.field] = { value: null, matchMode: FilterMatchMode.CONTAINS });
    setFilters(f);
  }, [columns]);

  useEffect(() => {
    if (!itemsSaveTrigger) return;
    saveAll();
  }, [itemsSaveTrigger]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.get("/ProductCategory/hierarchy?includeCategories=true");
      const categoriesArray: CategoryModel[] = response.categories ?? [];

      setActiveCategories(categoriesArray.filter(c => c.isActive));
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setActiveCategories([]);
    }
  };

  const addRow = () => {
    //if (Object.keys(editingRows).length > 0) return;

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

    const unitPrice = parseFloat(updatedRow.unitPrice) || 0;
    const quantity = parseFloat(updatedRow.quantity) || 0;
    const amount = parseFloat((unitPrice * quantity).toFixed(2));

    updatedRow.amount = amount;
    updatedRow.totalAmount = amount;
    updatedRow.totalAmount = amount;

    setTableData(prev => {
      const newData = prev.map(r => (r._tempKey || r[primaryKey]) === key ? { ...r, ...updatedRow, _edited: true } : r);
      onChange?.(newData);
      return newData;
    });
  };

  const cellEditor = (options: any, col: ColumnMeta<T>) => {
    const key = options.rowData._tempKey || options.rowData[primaryKey];
    const fieldError = errors[key]?.[col.field as string];

    const showError =
      (col.required && (options.value === null || options.value === "" || options.value === 0)) ||
      !!errors[key]?.[col.field as string];

    const updateValue = (value: any) => {
      const updatedRow = { ...options.rowData, [col.field]: value };
      options.editorCallback(value);
      markRowEdited(updatedRow);
    };

    switch (col.type) {
      case "inputdisabled":
        return (
          <InputText
            value={options.value || ""} disabled
            className={classNames({ "p-invalid": showError })}
            style={{ width: "100%" }} size="small"
            placeholder={col.placeholder}
          />

        );
      case "select":
        return (

          <Dropdown
            value={options.value}
            options={col.options || []}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => updateValue(e.value)}
            className={classNames("p-dropdown-sm", { "p-invalid": showError })}
            style={{ width: "100%" }}
          />

        );
      case "selectsearch":
        return (
          <Dropdown
            value={options.value}
            options={col.options || []}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => updateValue(e.value)}
            filter
            filterBy="label"
            showClear
            className={classNames("p-dropdown-sm", { "p-invalid": showError })}
          />
        );
      case "date":
        return (
          <div className={classNames("flex flex-col", { "mandatory-border": !!fieldError })}>
            <Calendar
              value={options.value ? new Date(options.value) : null}
              onChange={(e) => updateValue(e.value)}
              dateFormat="dd-mm-yy"
              className="p-inputtext-sm"
            />
          </div>
        );
      case "checkbox":
        return (
          <Checkbox checked={!!options.value} onChange={(e) => updateValue(e.checked)}
            className={classNames("p-checkbox-sm", { "p-invalid": showError })} />
        );
      case "number":
      case "decimal":
      case "currency":
        let inputMode: "decimal" | "currency" = "decimal";
        let inputCurrency: string | undefined;
        let minFrac: number | undefined;
        let maxFrac: number | undefined;

        if (col.type === "currency") {
          inputMode = "currency";
          inputCurrency = "INR";
        } else if (col.type === "decimal") {
          inputMode = "decimal";
          minFrac = 0;
          maxFrac = 2;
        }

        return (
          <InputNumber
            value={tableData.find(r => (r._tempKey || r[primaryKey]) === (options.rowData._tempKey || options.rowData[primaryKey]))?.[col.field] ?? 0}
            mode={inputMode}
            currency={inputCurrency}
            locale="en-IN"
            minFractionDigits={minFrac}
            maxFractionDigits={maxFrac}
            className={classNames("custom-width p-inputnumber-sm custom-xs", { "p-invalid": showError })}
            style={{ width: "100%" }}
            placeholder={col.placeholder}
            onValueChange={(e) => {
              const value = e.value ?? 0;
              const key = options.rowData._tempKey || options.rowData[primaryKey];

              // Update the row directly using the primary key / temp key
              setTableData((prev) =>
                prev.map((r) => {
                  if ((r._tempKey || r[primaryKey]) === key) {
                    const updated: any = { ...r, [col.field]: value };

                    const unitPrice = parseFloat(updated.unitPrice) || 0;
                    const quantity = parseFloat(updated.quantity) || 0;
                    updated.amount = parseFloat((unitPrice * quantity).toFixed(2));
                    updated.totalAmount = updated.amount;
                    updated._edited = true;

                    // Call onChange callback if needed
                    onChange?.(prev.map((row) => (row._tempKey || row[primaryKey]) === key ? updated : row));
                    options.editorCallback(value);

                    return updated;
                  }
                  return r;
                })
              );
            }}
          />
        );
      case "gst":
        return (
          <InputText
            value={options.value || ""}
            onChange={(e) => {
              const val = e.target.value;

              if (val === "" || /^[0-9]*\.?[0-9]{0,3}$/.test(val)) {
                const updatedRow = { ...options.rowData, gstPercent: val };

                const amount = parseFloat(updatedRow.amount) || 0;
                const gstPercent = parseFloat(val) || 0;
                updatedRow.gstAmount = parseFloat(((amount * gstPercent) / 100).toFixed(2));

                options.editorCallback(val);
                markRowEdited(updatedRow);
              }
            }}
            className={classNames("p-inputnumber-sm", { "p-invalid": showError })}
            style={{ width: "100%" }}
            placeholder={col.placeholder}
          />
        );
      case "productSearch":
        return (
          <InputText
            className={classNames("p-inputnumber-sm", { "p-invalid": showError })}
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
        );
      case "textdisabled":
        return (
          <InputText
            value={options.value || ""}
            onChange={(e) => updateValue(e.target.value)}
            className={classNames("p-inputnumber-sm", { "p-invalid": showError })}
            readOnly={true}
            placeholder={col.placeholder}
          />
        );
      default:
        return (
          <InputText
            value={options.value || ""}
            onChange={(e) => updateValue(e.target.value)}
            className={classNames("p-inputnumber-sm", { "p-invalid": showError })}
            placeholder={col.placeholder}
          />
        );
    }
  };

  const deleteSelected = () => {
    if (!selectedRows.length) return;

    // ⭐ REQUIRED → For each row, use tempKey or actual primaryKey
    const selectedKeys = selectedRows.map(r => r._tempKey || r[primaryKey]);

    setTableData(prev => {
      const remaining = prev.filter(r =>
        !selectedKeys.includes(r._tempKey || r[primaryKey])
      );

      onChange?.(remaining);
      return remaining;
    });

    setSelectedRows([]);
  };

  const isSaveEnabled = tableData.some((r) => r[primaryKey] === 0 || !!r._edited);

  const handleShipment = () => {
    setShowShipment(true);
  }

  const handleShipmentSuccess = (shipmentInfo: any) => {
    onShipment?.(shipmentInfo);
    setShowShipment(false);
    setShipmentModel(shipmentInfo);
  }

  const onCancelShipmentSideBar = () => {
    setShowShipment(false);
  };

  return (
    <div className="card p-3 h-[calc(100vh-100px)] overflow-auto">
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-2 mb-1 flex-none">
          <Button label="Add" icon="pi pi-plus" outlined onClick={addRow} size="small" className="p-button-sm custom-xs" tooltip="Add product"
            tooltipOptions={{ position: "bottom" }} />
          {isSave && < Button label="Save" icon="pi pi-save" severity="success" onClick={saveAll} disabled={!isSaveEnabled} size="small" className="p-button-sm custom-xs" />}
          {isDelete && tableData.length > 0 && <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={deleteSelected} disabled={!selectedRows.length} size="small" className="p-button-sm custom-xs" />}
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
          footer={
            <div className="custom-footer flex justify-between items-center gap-1 flex-wrap px-2 py-1">
              <div className="flex items-center gap-1 min-w-[200px] adjustment-section">
                <Button
                  label=""
                  icon="pi pi-truck"
                  severity={(shipmentModel?.shipmentId ?? 0) > 0 ? "success" : "info"}
                  style={{ fontSize: '0.85rem', padding: '2px 2px', height: '36px' }}
                  tooltip={(shipmentModel?.shipmentId ?? 0) > 0 ? "View Shipment" : "Add Shipment"}
                  tooltipOptions={{ position: "bottom" }}
                  onClick={handleShipment}
                />

                <Dropdown
                  value={selectedAdjustment}
                  options={adjustmentOptions}
                  onChange={(e) => {
                    setSelectedAdjustment(e.value);
                    setErrorDropdown(false);
                  }}
                  placeholder="Adjustment"
                  className={errorDropdown ? "p-invalid" : ""}
                  style={{ fontSize: '0.85rem' }}
                />
                <InputNumber
                  value={adjustmentValue}
                  onValueChange={(e) => setAdjustmentValue(e.value ?? 0)}
                  mode="currency"
                  currency="INR"
                  locale="en-IN"
                  inputStyle={{ width: "100px", fontSize: "0.85rem" }}
                  className={errorTextbox ? "p-invalid" : ""}
                />
                <Button
                  label=""
                  icon="pi pi-check"
                  severity="info"
                  style={{ fontSize: '0.85rem', padding: '2px 2px', height: '36px' }}
                  onClick={() => {

                    let hasError = false;
                    if (!selectedAdjustment) {
                      setErrorDropdown(true);
                      hasError = true;
                    } else {
                      setErrorDropdown(false);
                    }

                    if (
                      adjustmentValue === null ||
                      adjustmentValue === 0 ||
                      isNaN(adjustmentValue)
                    ) {
                      setErrorTextbox(true);
                      hasError = true;
                    } else {
                      setErrorTextbox(false);
                    }

                    if (hasError) return;

                    if (!selectedAdjustment) return;

                    const updatedAdjustments: any = {
                      ...adjustments,
                      [selectedAdjustment]: adjustmentValue,
                    };

                    setAdjustments(updatedAdjustments);

                    const finalAdjustmentResult = {
                      freightAmount: updatedAdjustments[1] || 0,
                      roundOff: (updatedAdjustments[2] || 0) - (updatedAdjustments[3] || 0),
                    };

                    onAdjustmentsChange?.(finalAdjustmentResult);

                    setSelectedAdjustment(null);
                    setAdjustmentValue(0);
                  }}
                  tooltip="Add adjustment"
                  tooltipOptions={{ position: "bottom" }}
                />

              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {adjustmentOptions.map((opt: any) => {
                  const value = adjustments[opt.value] || 0;
                  if (value == null || value == 0) return null;

                  return (
                    <span
                      key={opt.value}
                      className="flex items-center gap-1 px-2 py-0.5 text-sm font-semibold"
                      style={{
                        background: opt.value === 3 ? "#ff4d4d" : "#f39494ff",
                        color: "white",
                        borderRadius: 0,
                        minWidth: 130,
                        height: "87%",
                      }}
                    >
                      <span style={{ alignSelf: "center" }}>
                        {opt.label}: ₹{value}
                      </span>
                      <i
                        className="pi pi-times-circle cursor-pointer"
                        style={{ fontSize: "14px", alignSelf: "center" }}
                        onClick={() => {
                          const updated = { ...adjustments, [opt.value]: 0 };
                          setAdjustments(updated);
                          onAdjustmentsChange?.({
                            freightAmount: updated[1] || 0,
                            roundOff: (updated[2] || 0) - (updated[3] || 0),
                          });
                        }}
                      />
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <div
                  className="flex items-center justify-start px-2 py-0.5 text-sm font-semibold"
                  style={{ background: "#3498db", color: "white", borderRadius: 0, minWidth: 130, height: '87%' }}
                >
                  <span style={{ alignSelf: "center" }}>Total Amt: ₹{tableData.reduce((a, r) => a + (r.amount || 0), 0).toFixed(2)}</span>
                </div>

                <div
                  className="flex items-center justify-center px-2 py-0.5 text-sm font-semibold"
                  style={{ background: "#3498db", color: "white", borderRadius: 0, minWidth: 130, height: '87%' }}
                >
                  <span style={{ alignSelf: "center" }}>
                    Grand Total: ₹
                    {(
                      tableData.reduce((sum, row) => sum + (row.totalAmount || 0), 0)
                      + (adjustments[1] || 0)
                      + (adjustments[2] || 0)
                      - (adjustments[3] || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          }
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column header="No." body={(_, options) => options.rowIndex + 1} style={{ width: "70px", minWidth: "70px" }} />
          {columns.filter((col) => !col.hidden).map((col) => (
            <Column
              key={String(col.field)}
              field={col.field as string}
              header={<>{col.header} {col.required && <span className="required-asterisk">*</span>}</>}
              filter
              showFilterMenu={false}
              filterPlaceholder={`Search ${col.header}`}
              editor={col.editable ? (options) => cellEditor(options, col) : undefined}
              body={col.body ? (r: T) => col.body!(r) : undefined}
              style={{ width: col.width || "auto", minWidth: col.width || "120px" }}
            />
          ))}
          <Column rowEditor headerStyle={{ width: "5rem" }} bodyStyle={{ textAlign: "center" }} frozen={true} alignFrozen="right" />
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
          style={{ width: "850px" }}
          header="Select Products"
        >

          <div className="mb-3">
            <MultiSelect
              value={selectedCategory}
              options={[
                ...activeCategories.map((s: any) => ({
                  label: s.categoryName,
                  value: s.categoryId
                }))
              ]}
              onChange={(e) => setSelectedCategory(e.value)}
              placeholder="Select Categories"
              className="w-full"
              display="chip"
              filter
              showClear
            />
          </div>

          <InputText
            value={sidebarSearchText}
            onChange={(e) => setSidebarSearchText(e.target.value)}
            placeholder="Search Products"
            className="w-full mb-3"
          />

          <DataTable
            value={
              products.filter((p) => {
                const search = sidebarSearchText.trim().toLowerCase();

                const nameMatch =
                  search === "" ||
                  p.productName?.toLowerCase().includes(search);

                const priceMatch =
                  search === "" ||
                  p.salePrice?.toString().includes(search);

                const categoryMatch =
                  selectedCategory === null ||
                  selectedCategory.length === 0 ||
                  selectedCategory.includes(p.productCategoryId);

                return (nameMatch || priceMatch) && categoryMatch;
              })
            }
            selection={sidebarSelectedProducts}
            onSelectionChange={(e) => setSidebarSelectedProducts(e.value)}
            dataKey="productId"
            selectionMode="multiple"
            scrollable
            scrollHeight="300px"
            size="normal"
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            <Column field="productName" header="Name" style={{ minWidth: "200px" }} sortable />
            <Column field="brandName" header="Brand" style={{ minWidth: "120px" }} sortable />
            <Column
              field="quantity"
              header="Quantity"
              style={{ minWidth: "120px" }}
              sortable
              body={(row: any) => {
                const value = row.quantity;

                // Determine quantity symbol and background
                let symbol = "";
                let bgColor = "";
                if (value === 0) {
                  symbol = "❌"; // Out of stock
                  bgColor = "quantity-zero";
                } else if (value < 5) {
                  symbol = "⚠️"; // Low stock
                  bgColor = "quantity-low";
                } else {
                  symbol = "✅"; // Sufficient stock
                  bgColor = "quantity-high";
                }

                return (
                  <div
                    style={{
                      backgroundColor: bgColor,
                      padding: "4px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>{symbol}</span>
                    <span>{value}</span> {/* quantity number */}
                  </div>
                );
              }}
            />

            <Column field="salePrice" header="Rate" style={{ minWidth: "120px" }} sortable body={(row: any) =>
              new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.salePrice)
            } />
            <Column
              field="inventoryPurchasePrice"
              header="Pur. Price"
              style={{ minWidth: "120px" }}
              body={(row: any) => {
                const value = row.inventoryPurchasePrice;
                let bgColor = "";
                if (value === 0) bgColor = "quantity-zero";
                else if (value < 5) bgColor = "quantity-low";
                else bgColor = "quantity-high";

                return (
                  <div style={{ backgroundColor: bgColor, padding: "4px", borderRadius: "4px" }}>
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)}
                  </div>
                );
              }}
            />

          </DataTable>

          <div className="mt-3 flex justify-end gap-2">
            <Button label="Cancel" outlined onClick={() => setProductSidebarVisible(false)} icon="pi pi-times-circle" style={{ color: 'red' }} className="p-button-sm custom-xs" />
            <Button
              label="Add Selected"
              icon="pi pi-check"
              severity="success"
              className="p-button-sm custom-xs"
              onClick={() => {
                if (sidebarSelectedProducts.length <= 0) {
                  showError("Select at least one product");
                  return;
                }
                const newRows = sidebarSelectedProducts
                  .filter((p: ProductSearchModel) => {
                    // check if already exists in tableData
                    return !tableData.some(row => row.productId === p.productId);
                  }).map((p: ProductSearchModel) => {
                    const rowKey = `temp-${Date.now()}-${Math.random()}`;
                    return {
                      productId: p.productId,
                      productName: p.productName,
                      salePrice: p.salePrice,
                      unitPrice: p.salePrice,
                      supplierId: p.supplierId,
                      quantity: 0,
                      amount: 0,
                      totalAmount: 0,
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
          </div>
        </Sidebar>

        <Sidebar
          visible={showShipment}
          position="right"
          style={{ width: "850px" }}
          onHide={() => setShowShipment(false)}
          header="Add Shipment"
        >
          <SaleShipmentForm
            isEditSidebar={true}
            onSave={handleShipmentSuccess}
            onCancel={onCancelShipmentSideBar}
            shipmentInfo={shipmentInfo}
          />
        </Sidebar>

      </div>
    </div>
  );
}
