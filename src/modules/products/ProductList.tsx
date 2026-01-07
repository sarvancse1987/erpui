import React, { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { ProductModel } from "../../models/product/ProductModel";
import { CategoryModel } from "../../models/product/CategoryModel";
import { GroupModel } from "../../models/product/GroupModel";
import { BrandModel } from "../../models/product/BrandModel";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { OptionModel } from "../../models/product/OptionModel";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { ProductForm } from "./ProductForm";
import { Sidebar } from "primereact/sidebar";
import { useToast } from "../../components/ToastService";
import { Dropdown } from "primereact/dropdown";
import { TTypedDatatable } from "../../components/TTypedDatatable";
import { SupplierModel } from "../../models/supplier/SupplierModel";

export default function ProductList() {
  const [allGroups, setAllGroups] = useState<GroupModel[]>([]);
  const [allBrands, setAllBrands] = useState<BrandModel[]>([]);
  const [categories, setCategories] = useState<OptionModel[]>([]);
  const [units, setUnits] = useState<OptionModel[]>([]);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [newProducts, setNewProducts] = useState<ProductModel[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [allsuppliers, setAllsuppliers] = useState<OptionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadAllData = async () => {
    setLoading(true);
    try {
      const hierarchy = await apiService.get(
        "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true&includeBrands=true&includeProducts=true"
      );

      const cats: CategoryModel[] = hierarchy.categories ?? [];
      const grps: GroupModel[] = hierarchy.groups ?? [];
      const brs: BrandModel[] = hierarchy.brands ?? [];

      setAllGroups(grps);
      setAllBrands(brs);
      setCategories(cats.map((c) => ({ label: c.categoryName, value: c.categoryId })));

      const unitRes = await apiService.get("/Unit");
      setUnits((unitRes ?? []).map((u: any) => ({ label: u.name, value: u.id })));

      const initialProducts: ProductModel[] = hierarchy.products ?? [];
      setProducts(initialProducts);

      const suppliers = await apiService.get("/Supplier/getallsupplier");
      setAllsuppliers((suppliers?.suppliers ?? []).map((u: any) => ({ label: `${u.supplierName}${u.city != null ? ("-" + `${u.city}`) : ""}`, value: u.supplierId })));
    } catch (err) {
      console.error("Error loading product data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const createEmptyProduct = (): ProductModel => ({
    productId: 0,
    productName: "",
    productDescription: "",
    hsnCode: "",
    createdAt: new Date().toISOString(),
    isActive: true,
    purchasePrice: 0,
    gstPrice: 0,
    salePrice: 0,
    isGSTIncludedInPrice: false,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    primaryUnitId: 0,
    productCategoryId: 0,
    categoryName: "",
    categoryDescription: "",
    productGroupId: 0,
    groupName: "",
    groupDescription: "",
    productBrandId: 0,
    brandName: "",
    brandDescription: "",
    filteredGroups: [],
    filteredBrands: [],
    imagePreviewUrl: "",
    imageFile: null,
    tempKey: crypto.randomUUID()
  });

  const updateGSTPrice = (product: ProductModel) => {
    const totalGST = (product.cgstRate ?? 0) + (product.sgstRate ?? 0) + (product.igstRate ?? 0);
    product.gstPrice = product.isGSTIncludedInPrice
      ? product.purchasePrice
      : +(product.purchasePrice + (product.purchasePrice * totalGST) / 100).toFixed(2);
  };

  const addNewProduct = () => {
    setNewProducts((prev) => [createEmptyProduct(), ...prev]);
  };

  const handleUpdateNewProduct = (index: number, updatedProduct: ProductModel) => {
    setNewProducts((prev) => {
      const copy = [...prev];

      copy[index] = {
        ...copy[index],     // 🔐 preserves imageFile
        ...updatedProduct,
      };

      return copy;
    });
  };

  const handleRemoveNewProduct = (index: number) => {
    setNewProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProducts = async () => {
    const errors: Record<string, string> = {};

    newProducts.forEach((p, idx) => {
      if (!p.productName.trim()) errors[`product-${idx}-productName`] = "Product Name is required";
      if (!p.productCategoryId) errors[`product-${idx}-productCategoryId`] = "Category is required";
      if (!p.productGroupId) errors[`product-${idx}-productGroupId`] = "Group is required";
      if (!p.productBrandId) errors[`product-${idx}-productBrandId`] = "Brand is required";
      if (!p.purchasePrice) errors[`product-${idx}-purchasePrice`] = "Purchase Price is required";
      if (!p.salePrice) errors[`product-${idx}-salePrice`] = "Sale Price is required";
      if (!p.primaryUnitId) errors[`product-${idx}-primaryUnitId`] = "Unit is required";
      if (!p.hsnCode.trim()) errors[`product-${idx}-hsnCode`] = "HSN Code is required";
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const savedProducts = await apiService.post("/Product/bulk", newProducts);
      for (let i = 0; i < savedProducts.length; i++) {
        const saved = savedProducts[i];
        const local = newProducts[i];

        // 📁 FILE UPLOAD
        if (local.imageFile instanceof File) {
          const formData = new FormData();
          formData.append("file", local.imageFile);
          formData.append("productId", saved.productId.toString());

          await apiService.upload("/product/upload/uploadproductimage", formData);
        } else {
          // 📷 BASE64 (Webcam)
          if (local.imagePreviewUrl) {
            await apiService.post("/product/upload-image", {
              id: saved.productId,
              imageBase64: local.imagePreviewUrl,
            });
          }
        }
      }

      await loadAllData();
      setNewProducts([]);
      setValidationErrors({});
      showSuccess("Products saved successfully!");
    } catch (err) {
      console.error(err);
      showError('Error updating product. Please try again.');
    }
  };

  const handleOpenEdit = (product: ProductModel) => {
    setSelectedProduct({ ...product });
    setSidebarVisible(true);
  };

  const handleUpdateProduct = async (updatedProduct: ProductModel) => {
    try {
      // ✅ Only call API first
      if (updatedProduct.productId) {
        await apiService.put(`/Product/${updatedProduct.productId}`, updatedProduct);
      }

      // ✅ Update local state only after API success
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.productId === updatedProduct.productId ? { ...updatedProduct } : p
        )
      );

      if (updatedProduct.imageFile instanceof File) {
        const formData = new FormData();
        formData.append("file", updatedProduct.imageFile);
        formData.append("productId", updatedProduct.productId.toString());

        await apiService.upload("/product/upload/uploadproductimage", formData);
      } else {
        // 📷 BASE64 (Webcam)
        if (updatedProduct.imagePreviewUrl) {
          await apiService.post("/product/upload-image", {
            id: updatedProduct.productId,
            imageBase64: updatedProduct.imagePreviewUrl,
          });
        }
      }

      await loadAllData();
      showSuccess('Product updated successfully!');

      // ✅ Close sidebar only after API and state update
      setSidebarVisible(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error updating product:", err);
      showError('Error updating product. Please try again.');
    }
  };

  const getLabel = (options: OptionModel[], value: string | number) =>
    options.find((opt) => opt.value === value)?.label || "";

  const searchDropdownEditor = (options: any, field: any) => {
    return (
      <Dropdown
        value={options.value[field]}
        options={options.column.props.options}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select"
        filter
        showClear
        className="w-full"
        style={{ minWidth: "140px" }}
      />
    );
  };

  const columns: ColumnMeta<ProductModel>[] = [
    { field: "productId", header: "ID", width: "80px", hidden: true },
    {
      field: "productName",
      header: "Product Name",
      editable: true,
      required: true,
      width: "170px",
      frozen: true,
    },
    {
      field: "supplierName",
      header: "Supplier Name",
      editable: true,
      width: "170px",
    },
    {
      field: "categoryName",
      header: "Category",
      editable: true,
      type: "selectsearch",
      options: categories,
      required: true,
      width: "120px",
      editor: (options) => searchDropdownEditor(options, "categoryName")
    },
    {
      field: "groupName",
      header: "Group",
      editable: true,
      type: "selectsearch",
      required: true,
      width: "160px",
      options: allGroups.map(g => ({ label: g.groupName, value: g.groupId })),
      editor: (options) => searchDropdownEditor(options, "groupName")
    },
    {
      field: "brandName",
      header: "Brand",
      editable: true,
      type: "selectsearch",
      required: true,
      width: "110px",
      options: allBrands.map(b => ({ label: b.brandName, value: b.brandId })),
      editor: (options) => searchDropdownEditor(options, "brandName")
    },
    {
      field: "primaryUnitId",
      header: "Unit",
      editable: true,
      type: "selectsearch",
      options: units,
      body: (row) => getLabel(units, row.primaryUnitId),
      width: "60px",

    },
    {
      field: "purchasePrice",
      header: "Pur. Price",
      editable: true,
      type: "number",
      width: "100px",
      required: true,
      body: (row: any) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.purchasePrice),
      onValueChange: (value: any, row: any) => {
        row.purchasePrice = value;
        updateGSTPrice(row);
        setProducts([...products]);
      },
    },
    {
      field: "gstPrice",
      header: "GST Price",
      editable: false,
      type: "number",
      width: "90px",
      body: (row: any) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.gstPrice),
    },
    {
      field: "isGSTIncludedInPrice",
      header: "Incl. GST",
      editable: true,
      type: "checkbox",
      width: "80px",
      onValueChange: (value, row) => {
        row.isGSTIncludedInPrice = value;
        updateGSTPrice(row);
        setProducts([...products]);
      },
      body: (row) => (
        <i
          className={`pi ${row.isGSTIncludedInPrice ? "pi-check-circle" : "pi-times-circle"}`}
          style={{ color: row.isGSTIncludedInPrice ? "green" : "red", fontSize: "1.2rem" }}
        />
      ),
    },
    {
      field: "salePrice",
      header: "Sale Price",
      editable: true,
      type: "number",
      width: "110px",
      required: true,
      body: (row: any) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.salePrice),
    },
    {
      field: "cgstRate",
      header: "CGST %",
      editable: true,
      type: "decimal",
      width: "85px",
      required: true,
      onValueChange: (row, value) => {
        if (row != null) {
          row.cgstRate = value;
          updateGSTPrice(row);
          setProducts([...products]);
        }
      },
    },
    {
      field: "sgstRate",
      header: "SGST %",
      editable: true,
      type: "decimal",
      width: "85px",
      required: true,
      onValueChange: (row, value) => {
        if (row != null) {
          row.sgstRate = value;
          updateGSTPrice(row);
          setProducts([...products]);
        }
      },
    },
    // {
    //   field: "igstRate",
    //   header: "IGST %",
    //   editable: true,
    //   type: "decimal",
    //   width: "100px",
    //   onValueChange: (value, row) => {
    //     row.igstRate = value;
    //     updateGSTPrice(row);
    //     setProducts([...products]);
    //   },
    // },
  ];

  const onActiveDelete = async (toDelete: ProductModel[]) => {
    const updatedWithActive = toDelete.map(c => ({ ...c, isActive: false }));
    try {
      await apiService.post("/Product/bulk", updatedWithActive);
      await loadAllData();
      setNewProducts([]);
      setValidationErrors({});
      showSuccess("Products deleted successfully!");
    } catch (err) {
      console.error(err);
      showError('Error delete product. Please try again.');
    }
  }

  if (loading) return <p>Loading data...</p>;

  return (
    <>
      <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
        <h2 className="text-lg font-semibold mb-1">🛒 Product Management</h2>

        <TabView>
          <TabPanel header={
            <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
              <i className="pi pi-check-circle" />
              <span>Active</span>
            </div>
          }>
            {products.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              <div className="space-y-2">
                <TTypeDatatable<ProductModel>
                  data={products}
                  columns={columns}
                  primaryKey="productId"
                  onEdit={(row: ProductModel) => handleOpenEdit(row)}
                  isNew={false}
                  isSave={false}
                  isDelete={true}
                  onDelete={onActiveDelete}
                  sortableColumns={['productName', 'categoryName', 'groupName', 'brandName', 'purchasePrice', 'salePrice', 'supplierName']}
                />
              </div>
            )}
          </TabPanel>

          <TabPanel header={
            <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
              <i className="pi pi-plus-circle" />
              <span>Add New</span>
            </div>
          }>
            <div className="flex gap-2 mb-4">
              <Button label="Add" icon="pi pi-plus" outlined onClick={addNewProduct} size="small" className="p-button-info custom-xs" />
              {newProducts.length > 0 && (<Button label="Save" icon="pi pi-save" onClick={handleSaveProducts} size="small" className="p-button-sm custom-xs" />)}
            </div>

            <div className="space-y-4">
              {newProducts.length === 0 ? (
                <p className="text-gray-500">Click "Add" to create.</p>
              ) : (
                newProducts.map((product, idx) => (
                  <ProductForm
                    key={product.tempKey}
                    product={product}
                    index={idx}
                    categories={categories}
                    allGroups={allGroups}
                    allBrands={allBrands}
                    units={units}
                    suppliers={allsuppliers}
                    validationErrors={validationErrors}
                    onSave={(updatedProduct) => handleUpdateNewProduct(idx, updatedProduct)}
                    onCancel={() => handleRemoveNewProduct(idx)}
                    isEditSidebar={false}
                  />
                ))
              )}
            </div>
          </TabPanel>
        </TabView>

        {/* Sidebar for editing existing product */}
        <Sidebar
          visible={sidebarVisible}
          position="right"
          onHide={() => setSidebarVisible(false)}
          style={{ width: '75rem', height: '100%' }}
          showCloseIcon={false}
        >
          {selectedProduct ? (
            <div className="p-2 overflow-y-auto max-h-[80vh]"> {/* scrollable for longer forms */}
              <ProductForm
                key={selectedProduct.productId || "edit"}
                product={selectedProduct}
                categories={categories}
                allGroups={allGroups}
                allBrands={allBrands}
                units={units}
                suppliers={allsuppliers}
                validationErrors={validationErrors}
                onSave={(updatedProduct) => {
                  handleUpdateProduct(updatedProduct);
                  setSidebarVisible(false);
                }}
                onCancel={() => setSidebarVisible(false)}
                isEditSidebar={true}
              />
            </div>
          ) : (
            <div className="p-2 text-gray-500 text-center">
              Select a product to edit.
            </div>
          )}
        </Sidebar>
      </div>
    </>
  );
}
