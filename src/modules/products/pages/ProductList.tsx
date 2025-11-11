import React, { useEffect, useState } from "react";
import apiService from "../../../services/apiService";
import { ProductModel } from "../../../models/product/ProductModel";
import { CategoryModel } from "../../../models/product/CategoryModel";
import { GroupModel } from "../../../models/product/GroupModel";
import { BrandModel } from "../../../models/product/BrandModel";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { OptionModel } from "../../../models/product/OptionModel";
import { TTypeDatatable } from "../../../components/TTypeDatatable";
import { ColumnMeta } from "../../../models/component/ColumnMeta";

export default function ProductPage() {
  const [allGroups, setAllGroups] = useState<GroupModel[]>([]);
  const [allBrands, setAllBrands] = useState<BrandModel[]>([]);
  const [categories, setCategories] = useState<OptionModel[]>([]);
  const [units, setUnits] = useState<OptionModel[]>([]);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [addedProducts, setAddedProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
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
        setCategories(cats.map(c => ({ label: c.categoryName, value: c.categoryId })));

        const unitRes = await apiService.get("/Unit");
        setUnits((unitRes ?? []).map((u: any) => ({ label: u.name, value: u.id })));

        const initialProducts: ProductModel[] = hierarchy.products ?? [];
        if (!initialProducts.length) initialProducts.push(createEmptyProduct());
        setProducts(initialProducts);
      } catch (err) {
        console.error("Error loading product data", err);
      } finally {
        setLoading(false);
      }
    };
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
  });

  const updateGSTPrice = (product: ProductModel) => {
    const totalGST = (product.cgstRate ?? 0) + (product.sgstRate ?? 0) + (product.igstRate ?? 0);
    product.gstPrice = product.isGSTIncludedInPrice
      ? product.purchasePrice
      : +(product.purchasePrice + (product.purchasePrice * totalGST) / 100).toFixed(2);
  };

  const handleChange = (product: ProductModel, field: keyof ProductModel, value: any) => {
    (product as any)[field] = value;

    if (["purchasePrice", "cgstRate", "sgstRate", "igstRate", "isGSTIncludedInPrice"].includes(field)) {
      updateGSTPrice(product);
    }

    const idx = products.indexOf(product);
    const errorKey = `product-${idx}-${field}`;
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (
        (typeof value === "string" && value.trim() !== "") ||
        (typeof value === "number" && value !== 0) ||
        (typeof value === "boolean")
      ) {
        delete newErrors[errorKey];
      }
      return newErrors;
    });

    setProducts([...products]);
  };

  const addNewProduct = () => setProducts([createEmptyProduct(), ...products]);

  const deleteProduct = (index: number) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated.length ? updated : [createEmptyProduct()]);
  };

  const handleCategoryChange = (product: ProductModel, categoryId: number) => {
    handleChange(product, "productCategoryId", categoryId);
    const filteredGroups = allGroups
      .filter(g => g.categoryId === categoryId && g.isActive)
      .map(g => ({ label: g.groupName, value: g.groupId }));

    product.filteredGroups = filteredGroups;
    product.productGroupId = 0;
    product.filteredBrands = [];
    product.productBrandId = 0;

    const idx = products.indexOf(product);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`product-${idx}-productGroupId`];
      delete newErrors[`product-${idx}-productBrandId`];
      return newErrors;
    });

    setProducts([...products]);
  };

  const handleGroupChange = (product: ProductModel, groupId: number) => {
    handleChange(product, "productGroupId", groupId);

    const filteredBrands = allBrands
      .filter(b => b.groupId === groupId && b.isActive)
      .map(b => ({ label: b.brandName, value: b.brandId }));

    product.filteredBrands = filteredBrands;
    product.productBrandId = 0;

    const idx = products.indexOf(product);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`product-${idx}-productBrandId`];
      return newErrors;
    });

    setProducts([...products]);
  };

  const validateProducts = (): boolean => {
    const errors: Record<string, string> = {};
    products.forEach((p, idx) => {
      if (!p.productName.trim()) errors[`product-${idx}-productName`] = "Product Name is required";
      if (!p.productCategoryId) errors[`product-${idx}-productCategoryId`] = "Category is required";
      if (!p.productGroupId) errors[`product-${idx}-productGroupId`] = "Group is required";
      if (!p.productBrandId) errors[`product-${idx}-productBrandId`] = "Brand is required";
      if (!p.purchasePrice) errors[`product-${idx}-purchasePrice`] = "Purchase Price is required";
      if (!p.salePrice) errors[`product-${idx}-salePrice`] = "Sale Price is required";
      if (!p.hsnCode.trim()) errors[`product-${idx}-hsnCode`] = "HSN Code is required";
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProducts = async () => {
    if (!validateProducts()) return;
    try {
      await apiService.post("/Product/bulk", products);
      setAddedProducts([...addedProducts, ...products.map(p => ({ ...p }))]); // copy saved products
      setProducts([createEmptyProduct()]);
      alert("Products saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving products");
    }
  };

  const getLabel = (options: OptionModel[], value: string | number) =>
    options.find((opt) => opt.value === value)?.label || "";

  const columns: ColumnMeta<ProductModel>[] = [
    { field: "productId", header: "ID", width: "80px" },
    {
      field: "productName",
      header: "Product Name",
      editable: true,
      required: true,
      width: "220px",
    },
    {
      field: "categoryName",
      header: "Category",
      editable: true,
      type: "select",
      options: categories,
      required: true,
      width: "160px",
    },
    {
      field: "groupName",
      header: "Group",
      editable: true,
      type: "select",
      required: true,
      width: "160px",
    },
    {
      field: "brandName",
      header: "Brand",
      editable: true,
      type: "select",
      required: true,
      width: "160px",
    },
    {
      field: "primaryUnitId",
      header: "Unit",
      editable: true,
      type: "select",
      options: units,
      body: (row) => getLabel(units, row.primaryUnitId),
      width: "160px",
    },
    {
      field: "purchasePrice",
      header: "Pur. Price",
      editable: true,
      type: "number",
      width: "130px",
      required: true,
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
      width: "130px",
    },
    {
      field: "isGSTIncludedInPrice",
      header: "Incl. GST",
      editable: true,
      type: "checkbox",
      width: "100px",
      onValueChange: (value, row) => {
        row.isGSTIncludedInPrice = value;
        updateGSTPrice(row);
        setProducts([...products]);
      },
      body: (row) => (
        <i
          className={`pi ${row.isGSTIncludedInPrice
            ? "pi-check-circle text-green-500"
            : "pi-times-circle text-red-500"
            }`}
        />
      ),
    },
    {
      field: "salePrice",
      header: "Sale Price",
      editable: true,
      type: "number",
      width: "130px",
      required: true,
    },
    {
      field: "cgstRate",
      header: "CGST %",
      editable: true,
      type: "decimal",
      width: "100px",
      onValueChange: (value, row) => {
        row.cgstRate = value;
        updateGSTPrice(row);
        setProducts([...products]);
      },
    },
    {
      field: "sgstRate",
      header: "SGST %",
      editable: true,
      type: "decimal",
      width: "100px",
      onValueChange: (value, row) => {
        row.sgstRate = value;
        updateGSTPrice(row);
        setProducts([...products]);
      },
    },
    {
      field: "igstRate",
      header: "IGST %",
      editable: true,
      type: "decimal",
      width: "100px",
      onValueChange: (value, row) => {
        row.igstRate = value;
        updateGSTPrice(row);
        setProducts([...products]);
      },
    },
  ];

  if (loading) return <p>Loading data...</p>;

  return (
    <>
      <div className="p-3 h-[calc(100vh-100px)] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">🛒 Product Management</h2>

        <TabView>
          <TabPanel header="Products">
            {products.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              <div className="space-y-2">
                <TTypeDatatable<ProductModel>
                  data={products}
                  columns={columns}
                  primaryKey="productId" />
              </div>
            )}
          </TabPanel>

          <TabPanel header="Add / Edit Products">
            <div className="flex gap-2 mb-4">
              <Button label="Add New" icon="pi pi-plus" outlined severity="success" onClick={addNewProduct} />
              <Button label="Save" icon="pi pi-save" onClick={handleSaveProducts} disabled={!products.length} />
            </div>

            <div className="space-y-4">
              {products.map((product, idx) => (
                <fieldset key={idx} className="border border-gray-300 rounded-md p-4 bg-white">
                  <legend className="text-sm font-semibold px-2 text-gray-700">Product {idx + 1}</legend>

                  {/* Row 1 */}
                  <div className="flex flex-wrap gap-3 p-1">
                    {/* Product Name */}
                    <div className="flex-1 min-w-[140px]">
                      <strong>Name</strong>
                      <InputText
                        className={`w-full mt-1 ${validationErrors[`product-${idx}-productName`] ? "mandatory-border" : ""}`}
                        value={product.productName}
                        onChange={(e) => handleChange(product, "productName", e.target.value)} />
                      {validationErrors[`product-${idx}-productName`] && (
                        <small className="mandatory-error">{validationErrors[`product-${idx}-productName`]}</small>
                      )}
                    </div>

                    {/* Category */}
                    <div className="flex-1 min-w-[140px]">
                      <strong>Category</strong>
                      <Dropdown
                        className={`w-full mt-1 ${validationErrors[`product-${idx}-productCategoryId`] ? "mandatory-border" : ""}`}
                        value={product.productCategoryId}
                        options={categories}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => handleCategoryChange(product, e.value)} />
                      {validationErrors[`product-${idx}-productCategoryId`] && (
                        <small className="mandatory-error">{validationErrors[`product-${idx}-productCategoryId`]}</small>
                      )}
                    </div>

                    {/* Group */}
                    <div className="flex-1 min-w-[140px]">
                      <strong>Group</strong>
                      <Dropdown
                        className={`w-full mt-1 ${validationErrors[`product-${idx}-productGroupId`] ? "mandatory-border" : ""}`}
                        value={product.productGroupId}
                        options={product.filteredGroups ?? []}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => handleGroupChange(product, e.value)} />
                      {validationErrors[`product-${idx}-productGroupId`] && (
                        <small className="mandatory-error">{validationErrors[`product-${idx}-productGroupId`]}</small>
                      )}
                    </div>

                    {/* Brand */}
                    <div className="flex-1 min-w-[140px]">
                      <strong>Brand</strong>
                      <Dropdown
                        className={`w-full mt-1 ${validationErrors[`product-${idx}-productBrandId`] ? "mandatory-border" : ""}`}
                        value={product.productBrandId}
                        options={product.filteredBrands ?? []}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => handleChange(product, "productBrandId", e.value)} />
                      {validationErrors[`product-${idx}-productBrandId`] && (
                        <small className="mandatory-error">{validationErrors[`product-${idx}-productBrandId`]}</small>
                      )}
                    </div>

                    {/* Unit */}
                    <div className="flex-1 min-w-[140px]">
                      <strong>Unit</strong>
                      <Dropdown
                        className="w-full mt-1"
                        value={product.primaryUnitId}
                        options={units}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => handleChange(product, "primaryUnitId", e.value)} />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-wrap gap-2 p-1">
                    <div className="flex-1 min-w-[140px]">
                      <strong>Purchase Price</strong>
                      <InputNumber
                        className={`w-full mt-1 ${validationErrors[`product-${idx}-purchasePrice`] ? "mandatory-border" : ""}`}
                        value={product.purchasePrice}
                        mode="currency"
                        currency="INR"
                        locale="en-IN"
                        onValueChange={(e) => handleChange(product, "purchasePrice", e.value)} />
                      {validationErrors[`product-${idx}-purchasePrice`] && (
                        <small className="mandatory-error">{validationErrors[`product-${idx}-purchasePrice`]}</small>
                      )}
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <strong>Sale Price</strong>
                      <InputNumber
                        className={`w-full mt-1 ${validationErrors[`product-${idx}-salePrice`] ? "mandatory-border" : ""}`}
                        value={product.salePrice}
                        mode="currency"
                        currency="INR"
                        locale="en-IN"
                        onValueChange={(e) => handleChange(product, "salePrice", e.value)} />
                      {validationErrors[`product-${idx}-salePrice`] && (
                        <small className="mandatory-error">{validationErrors[`product-${idx}-salePrice`]}</small>
                      )}
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <strong>GST Price</strong>
                      <InputNumber value={product.gstPrice} mode="currency" currency="INR" locale="en-IN" disabled />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <strong>CGST %</strong>
                      <InputNumber
                        className="w-full mt-1"
                        value={product.cgstRate}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={2}
                        onValueChange={(e) => handleChange(product, "cgstRate", e.value)} />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <strong>SGST %</strong>
                      <InputNumber
                        className="w-full mt-1"
                        value={product.sgstRate}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={2}
                        onValueChange={(e) => handleChange(product, "sgstRate", e.value)} />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex flex-wrap gap-3 p-1">
                    <div className="flex-1 min-w-[140px]">
                      <strong>IGST %</strong>
                      <InputNumber
                        className="w-full mt-1"
                        value={product.igstRate}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={2}
                        onValueChange={(e) => handleChange(product, "igstRate", e.value)} />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <strong>HSN Code</strong>
                      <InputText
                        className={`w-full mt-1 ${validationErrors[`product-${idx}-hsnCode`] ? "mandatory-border" : ""}`}
                        value={product.hsnCode}
                        onChange={(e) => handleChange(product, "hsnCode", e.target.value)} />
                      {validationErrors[`product-${idx}-hsnCode`] && (
                        <small className="mandatory-error">{validationErrors[`product-${idx}-hsnCode`]}</small>
                      )}
                    </div>

                    <div className="flex-1 min-w-[140px] flex items-center justify-center gap-2">
                      <strong>GST Include</strong>
                      <Checkbox
                        checked={product.isGSTIncludedInPrice}
                        onChange={(e) => handleChange(product, "isGSTIncludedInPrice", e.checked)} />
                    </div>

                    <div className="flex-1 min-w-[140px] flex items-center justify-center">
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-sm p-button-danger"
                        onClick={() => deleteProduct(idx)} />
                    </div>
                  </div>
                </fieldset>
              ))}
            </div>
          </TabPanel>
        </TabView>
      </div>
    </>
  );
}
