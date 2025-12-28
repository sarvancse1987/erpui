import React, { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import apiService from "../../services/apiService";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { Sidebar } from "primereact/sidebar";
import { Tag } from "primereact/tag";
import { InventoryModel } from "../../models/inventory/InventoryModel";
import { useToast } from "../../components/ToastService";
import InventoryUpdateForm from "./InventoryUpdateForm";

export default function InventoryForm({
}: any) {

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedAvailableProducts, setSelectedAvailableProducts] = useState<any[]>([]);

  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  const [selectedAvailableBrand, setSelectedAvailableBrand] = useState<any[]>([]);

  const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
  const [selectedAvailableSupplier, setSelectedAvailableSupplier] = useState<any[]>([]);

  const [searchText, setSearchText] = useState("");

  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [selectedInventoryProducts, setSelectedInventoryProducts] = useState<any[]>([]);

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const [brands, setBrands] = useState<any[]>([]);
  const [selectBrands, setSelectedBrands] = useState<any[]>([]);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any[]>([]);
  const [sidebarSearchText, setSidebarSearchText] = useState("");

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState<boolean>(false);
  const [selectedEditProducts, setSelectedEditProducts] = useState<any>({});

  const fetchBrands = async () => {
    try {
      const response = await apiService.get("/ProductCategory/hierarchy?includeBrands=true&includeProducts=true");

      const brands: any[] = response.brands ?? [];
      const products: any[] = response.products ?? [];

      setBrands(brands.filter(c => c.isActive));
      setProducts(products.filter(c => c.isActive));

      const availableProductList = (response.products ?? []).filter(
        (p: any) => p.isActive && p.availableQuantity > 0
      );

      if (availableProductList?.length > 0) {
        setAvailableProducts(availableProductList);
        const distinctBrands = Object.values(
          availableProductList.reduce((acc: any, p: any) => {
            const key = `${p.productBrandId}`;
            if (!acc[key]) {
              acc[key] = {
                brandName: p.brandName,
                productBrandId: p.productBrandId,
              };
            }
            return acc;
          }, {})
        );

        setAvailableBrands(distinctBrands)

        const distinctSuppliers = Object.values(
          availableProductList.reduce((acc: any, p: any) => {
            const key = `${p.supplierId}`;
            if (!acc[key]) {
              acc[key] = {
                supplierId: p.supplierId,
                supplierName: p.supplierName
              };
            }
            return acc;
          }, {})
        );

        setAvailableSuppliers(distinctSuppliers);
      }

      const suppliersList = await apiService.get("/Supplier");
      const supplierOptions = (suppliersList ?? []).map((pt: any) => ({
        supplierName: pt.supplierName,
        supplierId: pt.supplierId
      }));
      setSuppliers(supplierOptions);
    } catch (error) {
      console.error("Failed to fetch brands", error);
      setBrands([]);
    }
  };

  useEffect(() => {
    fetchBrands();
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const onAddSelectedProduct = () => {
    setInventoryProducts((prev: any[]) => {
      const existingIds = new Set(prev.map(p => p.productId));

      const newItems = selectedProducts
        .filter(p => !existingIds.has(p.productId))
        .map(p => ({
          ...p,
          addedQuantity: 0,
          currentPurchasePrice: p.previousPurchasePrice ?? 0,
          inventorySupplierId: p.supplierId ?? null
        }));

      return [...prev, ...newItems];
    });
  };

  const handleDeleteInventory = () => {
    setInventoryProducts((prev: any[]) =>
      prev.filter(p => !selectedInventoryProducts.some(s => s.productId === p.productId))
    );

    setSelectedInventoryProducts([]);
  };

  const updateProductField = (id: number, field: string, value: any) => {
    setInventoryProducts(prev =>
      prev.map(row =>
        row.productId === id ? { ...row, [field]: value } : row
      )
    );
  };

  const validateRow = (row: any) => {
    return {
      priceError: row.currentPurchasePrice === 0 || row.currentPurchasePrice === 0.000,
      qtyError: row.addedQuantity === 0 || row.addedQuantity === 0.000,
      supplierError: !row.inventorySupplierId
    };
  };

  const handleSaveForm = async () => {
    let hasError = false;

    const invalidRows = inventoryProducts.filter((row: any) => {
      const { priceError, qtyError, supplierError } = validateRow(row);
      return priceError || qtyError || supplierError;
    });

    if (invalidRows.length > 0) {
      hasError = true;
    }
    if (hasError) {
      return; // Stop save
    }

    const inventoryPayload: InventoryModel[] = inventoryProducts.map((row: any) => ({
      inventoryId: 0,
      productId: row.productId,
      productName: row.productName,
      quantity: (row.addedQuantity ?? 0) + (row.availableQuantity ?? 0),
      reorderLevel: 5,
      purchasePrice: row.currentPurchasePrice ?? 0,
      purchaseGST: 18,
      isActive: true,
      supplierId: row.inventorySupplierId ?? null,
    }));

    try {
      await apiService.post("/Inventory/bulk", inventoryPayload);
      await fetchBrands();
      setActiveIndex(0);
      showSuccess("Inventory saved successfully!");
    } catch (err) {
      console.error(err);
      showError("Error saving inventory!");
    }
  }

  const handleDeleteExistInventory = async () => {
    try {
      // Make sure you are sending only IDs
      const ids = selectedAvailableProducts.map((p: any) => p.inventoryId);

      await apiService.post("/Inventory/bulk-delete", ids);
      await fetchBrands();
      setActiveIndex(0);
      setSelectedAvailableProducts([]);
      showSuccess("Selected inventory deleted successfully!");
    } catch (err) {
      console.error(err);
      showError("Error deleting inventory!");
    }
  };

  const onUpdate = async (isSuccess: boolean) => {
    setIsEditSidebarOpen(isSuccess);
    const response = await apiService.get("/ProductCategory/hierarchy?includeBrands=false&includeProducts=true");
    const availableProductList = (response.products ?? []).filter(
      (p: any) => p.isActive && p.availableQuantity > 0
    );

    if (availableProductList?.length > 0) {
      setAvailableProducts(availableProductList);
    }
  }

  return (
    <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
      <h2 className="text-lg font-semibold mb-1"><i className="pi pi-fw pi-box"></i> Inventory Management</h2>

      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>

        <TabPanel header={
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <i className="pi pi-check-square" />
            <span>Available</span>
          </div>
        }>
          <div className="flex flex-wrap gap-3 p-1 mb-4">

            <div className="flex-1 min-w-[160px]">
              <strong>Brand</strong>
              <MultiSelect
                value={selectedAvailableBrand}
                options={availableBrands.map((c: any) => ({
                  label: c.brandName,
                  value: c.productBrandId
                }))}
                onChange={(e) => setSelectedAvailableBrand(e.value)}
                placeholder="Select brands"
                className="w-full mt-1"
                display="chip"
                filter
                showClear
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <strong>Supplier</strong>
              <MultiSelect
                value={selectedAvailableSupplier}
                options={availableSuppliers.map((c: any) => ({
                  label: c.supplierName,
                  value: c.supplierId
                }))}
                onChange={(e) => setSelectedAvailableSupplier(e.value)}
                placeholder="Select Supplier"
                className="w-full mt-1"
                display="chip"
                filter
                showClear
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <strong>Product</strong>
              <InputText
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search Product"
                className="w-full mt-1"
              />
            </div>

          </div>
          <div className="flex flex-wrap gap-3 p-1 mb-4">
            {selectedAvailableProducts.length > 0 && (
              <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={handleDeleteExistInventory} className="p-button-sm custom-xs" size="small" />)}
          </div>
          <DataTable
            value={availableProducts.filter((p: any) => {
              const search = searchText.toLowerCase();
              const nameMatch = p.productName.toLowerCase().includes(search);
              const brandMatch =
                selectedAvailableBrand.length === 0 ||
                selectedAvailableBrand.includes(p.productBrandId);
              const supplierMatch =
                selectedAvailableSupplier.length === 0 ||
                selectedAvailableSupplier.includes(p.supplierId);


              return nameMatch && brandMatch && supplierMatch;
            })}
            selection={selectedAvailableProducts}
            onSelectionChange={(e) => setSelectedAvailableProducts(e.value)}
            dataKey="productId"
            selectionMode="checkbox"
            scrollable
            scrollHeight="420px"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            paginatorTemplate={
              isMobile
                ? "PrevPageLink NextPageLink CurrentPageReport"
                : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            }
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column selectionMode="multiple" style={{ width: "3rem" }} />
            <Column
              header="Product Name"
              style={{ minWidth: "160px" }}
              body={(row) => (
                <div className="flex items-center gap-2">
                  <span>{row.productName}</span>

                  <i
                    className="pi pi-copy cursor-pointer text-blue-600 hover:text-blue-800"
                    onClick={() => navigator.clipboard.writeText(row.productName)}
                    title="Copy Product Name"
                  ></i>
                </div>
              )}
            />
            <Column field="brandName" header="Brand" style={{ minWidth: "100px" }} />
            <Column
              field="salePrice"
              header="Sale Price"
              body={(row) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR"
                }).format(row.previousPurchasePrice)
              }
              style={{ minWidth: "100px" }}
            />
            <Column
              field="availableQuantity"
              header="Ava. Qty"
              body={(row) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR"
                }).format(row.availableQuantity)
              }
              style={{ minWidth: "100px" }}
            />
            <Column field="inventorySupplierName" header="Supplier" style={{ minWidth: "150px" }} />
            <Column field="lastRestockedDate" header="Last Restocked" style={{ minWidth: "100px" }} />

            <Column
              header="Edit"
              body={(row) => (
                <Button
                  icon="pi pi-pencil"
                  className="p-button-sm p-button-rounded p-button-outlined p-button-info"
                  onClick={() => {
                    setSelectedEditProducts([row]); // preselect
                    setIsEditSidebarOpen(true);    // open sidebar
                  }}
                  tooltip="Edit Inventory"
                  tooltipOptions={{ position: "left" }}
                  style={{ width: "25px", height: "25px", padding: "0" }}
                />
              )}
              style={{ width: "4rem" }}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header={
          <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
            <i className="pi pi-plus-circle" />
            <span>Add New</span>
          </div>
        }>
          <div className={`border border-gray-200 rounded-md p-1 w-full"}`}>
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
              <legend className="text-sm font-semibold px-2 text-gray-700">
                Add / Update Inventory
              </legend>
              <div className="flex gap-2 mb-2">
                <Button label="Add" icon="pi pi-plus" onClick={() => setIsSidebarOpen(true)} className="p-button-info custom-xs" size="small" />
                {selectedInventoryProducts.length > 0 && (
                  <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={handleDeleteInventory} className="p-button-sm custom-xs" size="small" />)}

                {inventoryProducts.length > 0 && (
                  <Button label="Save" icon="pi pi-save" onClick={handleSaveForm} className="p-button-sm custom-xs"/>)}

              </div>

              <DataTable
                value={inventoryProducts}
                selection={selectedInventoryProducts}
                onSelectionChange={(e) => setSelectedInventoryProducts(e.value)}
                dataKey="productId"
                selectionMode="checkbox"
                scrollable
                scrollHeight="420px"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                paginatorTemplate={
                  isMobile
                    ? "PrevPageLink NextPageLink CurrentPageReport"
                    : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                }
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              >
                <Column selectionMode="multiple" style={{ width: "3rem" }} />
                <Column
                  header="Product Name"
                  style={{ minWidth: "160px" }}
                  body={(row) => (
                    <div className="flex items-center gap-2">
                      <span>{row.productName}</span>

                      <i
                        className="pi pi-copy cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => navigator.clipboard.writeText(row.productName)}
                        title="Copy Product Name"
                      ></i>
                    </div>
                  )}
                />
                <Column field="brandName" header="Brand" style={{ minWidth: "100px" }} />
                <Column
                  field="salePrice"
                  header="Sale Price"
                  body={(row) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR"
                    }).format(row.previousPurchasePrice)
                  }
                  style={{ minWidth: "100px" }}
                />
                <Column
                  field="availableQuantity"
                  header="Ava. Qty"
                  style={{ minWidth: "100px" }}
                  body={(row) => {
                    const value = row.availableQuantity ?? 0;

                    let severity: "success" | "danger" = "danger";

                    if (value > 0) {
                      severity = "success"; // green
                    } else {
                      severity = "danger"; // red for 0 or negative
                    }

                    return (
                      <Tag
                        value={value}
                        severity={severity}
                        style={{ width: "80px", justifyContent: "center" }}
                      />
                    );
                  }}
                />
                <Column field="inventorySupplierName" header="Supplier" style={{ minWidth: "150px" }} />
                <Column
                  header="Current Price"
                  body={(row) => {
                    const { priceError } = validateRow(row);

                    return (
                      <div>
                        <InputNumber
                          value={row.currentPurchasePrice ?? 0}
                          onValueChange={(e) =>
                            updateProductField(row.productId, "currentPurchasePrice", e.value)
                          }
                          placeholder="Enter price"
                          mode="decimal"
                          locale="en-IN"
                          minFractionDigits={3}
                          maxFractionDigits={3}
                          inputClassName={priceError ? "p-invalid" : ""}
                          inputStyle={{ width: "100px", fontSize: "0.85rem" }}
                        />
                      </div>
                    );
                  }}
                  style={{ minWidth: "150px" }}
                  className="custom-width p-inputnumber-sm custom-xs"
                />

                <Column
                  header="Add Qty"
                  body={(row) => {
                    const { qtyError } = validateRow(row);

                    return (
                      <div>
                        <InputNumber
                          value={row.addedQuantity ?? 0}
                          onValueChange={(e) =>
                            updateProductField(row.productId, "addedQuantity", e.value)
                          }
                          placeholder="Enter qty"
                          mode="decimal"
                          minFractionDigits={3}
                          maxFractionDigits={3}
                          inputClassName={qtyError ? "p-invalid" : ""}
                          inputStyle={{ width: "100px", fontSize: "0.85rem" }}
                        />
                      </div>
                    );
                  }}
                  style={{ minWidth: "150px" }}
                />
                <Column
                  header="Supplier"
                  body={(row) => {
                    const { supplierError } = validateRow(row);

                    return (
                      <div>
                        <Dropdown
                          value={row.inventorySupplierId ?? null}
                          options={suppliers.map((c: any) => ({
                            label: c.supplierName,
                            value: c.supplierId
                          }))}
                          onChange={(e) =>
                            updateProductField(row.productId, "inventorySupplierId", e.value)
                          }
                          placeholder="Select supplier"
                          className={supplierError ? "p-invalid w-full" : "w-full"}
                        />
                      </div>
                    );
                  }}
                  style={{ minWidth: "180px" }}
                />

              </DataTable>
            </fieldset>

            <Sidebar visible={isSidebarOpen}
              position="right"
              onHide={() => setIsSidebarOpen(false)}
              style={{ width: '70rem' }}
              header="Select Products">
              <div className="flex flex-wrap gap-3 p-1 mb-4">

                <div className="flex-1 min-w-[160px]">
                  <strong>Brand</strong>
                  <MultiSelect
                    value={selectBrands}
                    options={brands.map((c: any) => ({
                      label: c.brandName,
                      value: c.brandId
                    }))}
                    onChange={(e) => { debugger; setSelectedBrands(e.value) }}
                    placeholder="Select brands"
                    className="w-full mt-1"
                    display="chip"
                    filter
                    showClear
                  />
                </div>

                <div className="flex-1 min-w-[160px]">
                  <strong>Supplier</strong>
                  <MultiSelect
                    value={selectedSupplier}
                    options={suppliers.map((c: any) => ({
                      label: c.supplierName,
                      value: c.supplierId
                    }))}
                    onChange={(e) => setSelectedSupplier(e.value)}
                    placeholder="Select Supplier"
                    className="w-full mt-1"
                    display="chip"
                    filter
                    showClear
                  />
                </div>

                <div className="flex-1 min-w-[160px]">
                  <strong>Product</strong>
                  <InputText
                    value={sidebarSearchText}
                    onChange={(e) => setSidebarSearchText(e.target.value)}
                    placeholder="Search Product"
                    className="w-full mt-1"
                  />
                </div>

              </div>

              <DataTable
                value={products.filter((p: any) => {
                  const search = sidebarSearchText.toLowerCase();
                  const nameMatch = p.productName.toLowerCase().includes(search);
                  const brandMatch =
                    selectBrands.length === 0 ||
                    selectBrands.includes(p.productBrandId);
                  const supplierMatch =
                    selectedSupplier.length === 0 ||
                    selectedSupplier.includes(p.supplierId);

                  return nameMatch && brandMatch && supplierMatch;
                })}
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
                dataKey="productId"
                selectionMode="checkbox"
                scrollable
                scrollHeight="420px"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                paginatorTemplate={
                  isMobile
                    ? "PrevPageLink NextPageLink CurrentPageReport"
                    : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                }
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              >
                <Column selectionMode="multiple" style={{ width: "3rem" }} />
                <Column
                  header="Product Name"
                  style={{ minWidth: "160px" }}
                  body={(row) => (
                    <div className="flex items-center gap-2">
                      <span>{row.productName}</span>

                      <i
                        className="pi pi-copy cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => navigator.clipboard.writeText(row.productName)}
                        title="Copy Product Name"
                      ></i>
                    </div>
                  )}
                />
                <Column field="brandName" header="Brand" style={{ minWidth: "100px" }} />
                <Column
                  field="salePrice"
                  header="Sale Price"
                  body={(row) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR"
                    }).format(row.previousPurchasePrice)
                  }
                  style={{ minWidth: "100px" }}
                />
                <Column
                  field="availableQuantity"
                  header="Ava. Qty"
                  body={(row) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR"
                    }).format(row.availableQuantity)
                  }
                  style={{ minWidth: "100px" }}
                />
                <Column field="inventorySupplierName" header="Supplier" style={{ minWidth: "150px" }} />

              </DataTable>


              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }}
                  outlined onClick={() => setIsSidebarOpen(false)} className="p-button-sm custom-xs" />
                {selectedProducts.length > 0 && (<Button type="button" label="Add Selected" icon="pi pi-save" className="p-button-info custom-xs" onClick={onAddSelectedProduct} />)}
              </div>
            </Sidebar>

          </div>
        </TabPanel>
      </TabView >

      <Sidebar visible={isEditSidebarOpen}
        position="right"
        onHide={() => setIsEditSidebarOpen(false)}
        header="Edit Inventory"
        style={{ width: '70rem' }}>
        {selectedEditProducts ? (
          <InventoryUpdateForm
            onCancel={() => { setIsEditSidebarOpen(false); }}
            data={selectedEditProducts[0]}
            onSave={onUpdate}
          />
        ) : <p className="p-4 text-gray-500 text-center">Select a inventory to edit.</p>}
      </Sidebar>
    </div>
  );
}
