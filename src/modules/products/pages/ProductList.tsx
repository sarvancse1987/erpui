import React, { useEffect, useState } from "react";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { TTypeDatatable } from "../../../components/TTypeDatatable";
import apiService from "../../../services/apiService";
import { ProductModel } from "../../../models/product/ProductModel";
import { CategoryModel } from "../../../models/product/CategoryModel";
import { GroupModel } from "../../../models/product/GroupModel";
import { BrandModel } from "../../../models/product/BrandModel";

interface Option {
  label: string;
  value: string | number;
}

export default function ProductPage() {
  const [categories, setCategories] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        // 🔹 1. Fetch hierarchy (category, group, brand)
        const hierarchy = await apiService.get(
          "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true&includeBrands=true&includeProducts=true"
        );

        const categoryList: Option[] = (hierarchy.categories ?? []).map(
          (c: CategoryModel) => ({
            label: c.categoryName,
            value: c.categoryId,
          })
        );

        const groupList: Option[] = (hierarchy.groups ?? []).map((g: GroupModel) => ({
          label: g.groupName,
          value: g.groupId,
        }));

        const brandList: Option[] = (hierarchy.brands ?? []).map((b: BrandModel) => ({
          label: b.brandName,
          value: b.brandId,
        }));

        // 🔹 2. Fetch units
        const unitRes = await apiService.get("/Unit");
        const unitList: Option[] = (unitRes ?? []).map((u: any) => ({
          label: u.name,
          value: u.id,
        }));

        // 🔹 3. Fetch products
        const productList: ProductModel[] = hierarchy.products ?? [];

        setCategories(categoryList);
        setGroups(groupList);
        setBrands(brandList);
        setUnits(unitList);
        setProducts(productList);
      } catch (err) {
        console.error("Error loading product data", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Helper: Get label from dropdown
  const getLabel = (options: Option[], value: string | number) =>
    options.find((opt) => opt.value === value)?.label || "";

  // 🔹 Dynamic GST recalculation
  const updateGSTPrice = (row: ProductModel) => {
    const totalGST = (row.cgstRate ?? 0) + (row.sgstRate ?? 0) + (row.igstRate ?? 0);
    if (row.isGSTIncludedInPrice) {
      row.gstPrice = row.purchasePrice;
    } else {
      const gstAmount = (row.purchasePrice * totalGST) / 100;
      row.gstPrice = +(row.purchasePrice + gstAmount).toFixed(2);
    }
  };

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
      field: "productCategoryId",
      header: "Category",
      editable: true,
      type: "select",
      options: categories,
      required: true,
      body: (row) => getLabel(categories, row.productCategoryId),
      width: "160px",
    },
    {
      field: "productGroupId",
      header: "Group",
      editable: true,
      type: "select",
      options: groups,
      required: true,
      body: (row) => getLabel(groups, row.productGroupId),
      width: "160px",
    },
    {
      field: "productBrandId",
      header: "Brand",
      editable: true,
      type: "select",
      options: brands,
      required: true,
      body: (row) => getLabel(brands, row.productBrandId),
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
      header: "Purchase Price",
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
      header: "GST Included",
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
          className={`pi ${
            row.isGSTIncludedInPrice
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
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">🛒 Product Management</h2>

      <TTypeDatatable<ProductModel>
        data={products}
        columns={columns}
        primaryKey="productId"
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={async () => {
            try {
              await apiService.post("/Product/bulk", products);
              alert("Products saved successfully!");
            } catch (err) {
              console.error("Error saving products", err);
              alert("Error saving products");
            }
          }}
          className="p-button p-button-success px-4 py-2 rounded-md shadow"
        >
          Save Products
        </button>
      </div>
    </div>
  );
}
