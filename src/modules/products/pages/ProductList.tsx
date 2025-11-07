import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";

// Product type
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Fake API load
  useEffect(() => {
    const data: Product[] = [
      { id: 1, name: "Laptop", category: "Electronics", price: 80000, status: "ACTIVE" },
      { id: 2, name: "Table", category: "Furniture", price: 12000, status: "INACTIVE" },
    ];
    setProducts(data);
  }, []);

  const statusTemplate = (rowData: Product) => {
    return (
      <Tag
        value={rowData.status}
        severity={rowData.status === "ACTIVE" ? "success" : "danger"}
      />
    );
  };

  return (
    <div className="p-3">
      <Card title="Products">
        <div className="p-d-flex p-jc-end p-mb-3">
          <Button
            label="Add Product"
            icon="pi pi-plus"
            onClick={() => navigate("/products/add")}
          />
        </div>

        <DataTable value={products} paginator rows={10}>
          <Column field="id" header="#" style={{ width: "80px" }} />
          <Column field="name" header="Name" />
          <Column field="category" header="Category" />
          <Column field="price" header="Price (₹)" />
          <Column header="Status" body={statusTemplate} />
        </DataTable>
      </Card>
    </div>
  );
}
