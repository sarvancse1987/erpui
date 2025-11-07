import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";

export interface ProductFormData {
  id?: number;
  name: string;
  category: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
}

interface ProductFormProps {
  initialValue?: ProductFormData;
  onSubmit: (product: ProductFormData) => void;
  submitLabel?: string;
}

export default function ProductForm({
  initialValue,
  onSubmit,
  submitLabel = "Save"
}: ProductFormProps) {
  const [product, setProduct] = useState<ProductFormData>(
    initialValue ?? { name: "", category: "", price: 0, status: "ACTIVE" }
  );

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" }
  ];

  const categoryOptions = [
    { label: "Electronics", value: "Electronics" },
    { label: "Furniture", value: "Furniture" },
    { label: "Accessories", value: "Accessories" },
  ];

  const handleSubmit = () => {
    if (product.name.trim() === "") return alert("Product Name required!");
    onSubmit(product);
  };

  return (
    <Card title="Product Details">
      <div className="p-fluid formgrid grid">
        <div className="field col-12 md:col-6">
          <label>Name</label>
          <InputText
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Category</label>
          <Dropdown
            value={product.category}
            options={categoryOptions}
            onChange={(e) => setProduct({ ...product, category: e.value })}
            placeholder="Select Category"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Price</label>
          <InputNumber
            value={product.price}
            onValueChange={(e) =>
              setProduct({ ...product, price: e.value ?? 0 })
            }
            mode="currency"
            currency="INR"
            locale="en-IN"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Status</label>
          <Dropdown
            value={product.status}
            options={statusOptions}
            onChange={(e) => setProduct({ ...product, status: e.value })}
          />
        </div>
      </div>

      <div className="flex justify-content-end mt-3">
        <Button label={submitLabel} icon="pi pi-check" onClick={handleSubmit} />
      </div>
    </Card>
  );
}
