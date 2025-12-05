import React, { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import apiService from "../../services/apiService";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

export default function InventoryForm({
}: any) {

  const [selectedBrand, setSelectedBrand] = useState<any[]>([]);
  const [sidebarSearchText, setSidebarSearchText] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const fetchBrands = async () => {
    try {
      const response = await apiService.get("/ProductCategory/hierarchy?includeBrands=true&includeProducts=true");
      const brands: any[] = response.brands ?? [];
      const products: any[] = response.products ?? [];

      setBrands(brands.filter(c => c.isActive));
      setProducts(products.filter(c => c.isActive));

      const suppliersList = await apiService.get("/Supplier");
      const supplierOptions = (suppliersList ?? []).map((pt: any) => ({
        label: pt.supplierName,
        value: pt.supplierId
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

  // Handle quantity or purchase price change
  const updateField = (rowIndex: number, field: string, value: number) => {
    // setInventoryData((prev) => {
    //   const updated = [...prev];
    //   updated[rowIndex] = {
    //     ...updated[rowIndex],
    //     [field]: value,
    //     amount:
    //       field === "quantity"
    //         ? value * updated[rowIndex].purchasePrice
    //         : updated[rowIndex].quantity * value
    //   };
    //   return updated;
    // });
  };

  const updateProductField = (productId: number, field: string, value: any) => {
    setProducts(prev =>
      prev.map(p =>
        p.productId === productId ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
      <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
        <legend className="text-sm font-semibold px-2 text-gray-700">
          Inventory Management
        </legend>

        <div className="flex gap-2 mb-4">
          <Button label="Save" icon="pi pi-save" className="p-button-sm custom-xs" />
        </div>

        <div className="flex flex-wrap gap-3 p-1 mb-4">

          <div className="flex-1 min-w-[160px]">
            <strong>Select Brand</strong>
            <MultiSelect
              value={selectedBrand}
              options={brands.map((c: any) => ({
                label: c.brandName,
                value: c.brandId
              }))}
              onChange={(e) => setSelectedBrand(e.value)}
              placeholder="Select brands"
              className="w-full mt-1"
              display="chip"
              filter
              showClear
            />
          </div>

          <div className="flex-1 min-w-[160px]">
            <strong>Search Product</strong>
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
            const categoryMatch =
              selectedBrand.length === 0 ||
              selectedBrand.includes(p.productBrandId);

            return nameMatch && categoryMatch;
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
          <Column
            header="Current Price"
            body={(row) => (
              <InputNumber
                value={row.currentPurchasePrice ?? 0.00}
                onValueChange={(e) =>
                  updateProductField(row.productId, "currentPurchasePrice", e.value)
                }
                placeholder="Enter price"
                mode="decimal"
                locale="en-IN"
                minFractionDigits={0}
                maxFractionDigits={2}
                inputStyle={{ width: "100px", fontSize: "0.85rem" }}
              />
            )}
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Add Qty"
            body={(row) => (
              <InputNumber
                value={row.addedQuantity ?? ""}
                onValueChange={(e) =>
                  updateProductField(row.productId, "addedQuantity", e.value)
                }
                placeholder="Enter qty"
                inputStyle={{ width: "100px", fontSize: "0.85rem" }}
                minFractionDigits={0}
                maxFractionDigits={2}
                mode="decimal"
              />
            )}
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Supplier"
            body={(row) => (
              <Dropdown
                value={row.inventorySupplierId ?? null}
                options={suppliers}
                onChange={(e) =>
                  updateProductField(row.productId, "inventorySupplierId", e.value)
                }
                placeholder="Select supplier"
                className="w-full"
              />
            )}
            style={{ minWidth: "180px" }}
          />
        </DataTable>

      </fieldset>
    </div>
  );
}
