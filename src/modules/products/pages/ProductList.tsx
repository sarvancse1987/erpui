import React, { useEffect, useState } from "react";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../../components/TTypedDatatable";
import { TTypeDatatable } from "../../../components/TTypeDatatable";

interface Product {
  id: string;
  categoryId: string;
  groupId: string;
  brandId: string;
  name: string;
  unitId: string;
  purchasePrice: number;
  gstPrice: number;
  salePrice: number;
  isGSTIncludedInPrice: boolean;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
}

interface Option {
  label: string;
  value: string;
}

export default function ProductPage() {
  const [categories, setCategories] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const categoryList: Option[] = [
      { label: "Cement", value: "1" },
      { label: "Steel", value: "2" },
      { label: "Sand", value: "3" },
    ];

    const groupList: Option[] = [
      { label: "Ramco Cement", value: "101" },
      { label: "Tata Steel", value: "102" },
      { label: "River Sand", value: "103" },
    ];

    const brandList: Option[] = [
      { label: "Ramco", value: "B1" },
      { label: "UltraTech", value: "B2" },
      { label: "Tata", value: "B3" },
      { label: "Local", value: "B4" },
    ];

    const unitList: Option[] = [
      { label: "Bag", value: "U1" },
      { label: "Ton", value: "U2" },
      { label: "Kg", value: "U3" },
    ];

    const productList: Product[] = [
      {
        id: "P1",
        categoryId: "1",
        groupId: "101",
        brandId: "B1",
        name: "Ramco Super Grade",
        unitId: "U1",
        purchasePrice: 380,
        gstPrice: 400,
        salePrice: 420,
        isGSTIncludedInPrice: true,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
      },
      {
        id: "P2",
        categoryId: "2",
        groupId: "102",
        brandId: "B3",
        name: "Tata TMT Bar",
        unitId: "U2",
        purchasePrice: 55000,
        gstPrice: 58000,
        salePrice: 60000,
        isGSTIncludedInPrice: false,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
      },
    ];

    setCategories(categoryList);
    setGroups(groupList);
    setBrands(brandList);
    setUnits(unitList);
    setProducts(productList);
    setLoading(false);
  }, []);

  const getLabel = (options: Option[], value: string) =>
    options.find((opt) => opt.value === value)?.label || "";

  // 🔹 Function to recalculate GST Price dynamically
  const updateGSTPrice = (row: Product) => {
    const totalGSTPercent = (row.cgstRate || 0) + (row.sgstRate || 0) + (row.igstRate || 0);
    if (row.isGSTIncludedInPrice) {
      // GST Included → gstPrice = purchasePrice (already includes GST)
      row.gstPrice = row.purchasePrice;
    } else {
      // GST Not Included → gstPrice = purchasePrice + GST amount
      const gstAmount = (row.purchasePrice * totalGSTPercent) / 100;
      row.gstPrice = +(row.purchasePrice + gstAmount).toFixed(2);
    }
  };

  const columns: ColumnMeta<Product>[] = [
    { field: "id", header: "ID", width: "70px" },
    { field: "name", header: "Product Name", editable: true, required: true, width: "200px" },
    {
      field: "categoryId",
      header: "Category",
      editable: true,
      type: "select",
      options: categories,
      body: (row) => getLabel(categories, row.categoryId),
      width: "150px",
    },
    {
      field: "groupId",
      header: "Group",
      editable: true,
      type: "select",
      options: groups,
      body: (row) => getLabel(groups, row.groupId),
      width: "150px",
    },
    {
      field: "brandId",
      header: "Brand",
      editable: true,
      type: "select",
      options: brands,
      body: (row) => getLabel(brands, row.brandId),
      width: "150px",
    },
    {
      field: "unitId",
      header: "Unit",
      editable: true,
      type: "select",
      options: units,
      body: (row) => getLabel(units, row.unitId),
      width: "100px",
    },
    {
      field: "purchasePrice",
      header: "Purchase Price",
      editable: true,
      type: "number",
      width: "130px",
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
          className={`pi ${row.isGSTIncludedInPrice ? "pi-check-circle text-green-500" : "pi-times-circle text-red-500"}`}
        />
      ),
    },
    {
      field: "salePrice",
      header: "Sale Price",
      editable: true,
      type: "number",
      width: "130px",
    },
    {
      field: "cgstRate",
      header: "CGST %",
      editable: true,
      type: "gst",
      onValueChange: (row, value, tableData, setTableData) => {
        const purchase = Number(row["purchasePrice"] || 0);
        const sgst = Number(row["sgstRate"] || 0);
        const isGSTIncluded = !!row["isGSTIncludedInPrice"];

        const updatedRow = { ...row, cgstRate: value };
        updatedRow["gstPrice"] = isGSTIncluded
          ? purchase + (purchase * (value + sgst)) / 100
          : purchase;

        const updatedTable = tableData.map((r) =>
          r.id === updatedRow.id ? updatedRow : r
        );

        setTableData(updatedTable);
      },
    },
    {
      field: "sgstRate",
      header: "SGST %",
      editable: true,
      type: "gst",
      onValueChange: (row, value, tableData, setTableData) => {
        const purchase = Number(row["purchasePrice"] || 0);
        const cgst = Number(row["cgstRate"] || 0);
        const isGSTIncluded = !!row["isGSTIncludedInPrice"];

        const updatedRow = { ...row, sgstRate: value };
        updatedRow["gstPrice"] = isGSTIncluded
          ? purchase + (purchase * (cgst + value)) / 100
          : purchase;

        const updatedTable = tableData.map((r) =>
          r.id === updatedRow.id ? updatedRow : r
        );

        setTableData(updatedTable);
      },
    },
    {
      field: "igstRate",
      header: "IGST %",
      editable: true,
      type: "decimal",
      width: "80px",
      onValueChange: (value, row) => {
        row.igstRate = value;
        updateGSTPrice(row);
        setProducts([...products]);
      },
    },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">🛒 Product Management</h2>

      <TTypeDatatable<Product> data={products} columns={columns} primaryKey="id" />

      <div className="mt-4 flex justify-end">
        <button className="p-button p-button-success px-4 py-2 rounded-md shadow">
          Save Products
        </button>
      </div>
    </div>
  );
}
