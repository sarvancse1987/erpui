import React, { useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

interface InventoryRecord {
    id: number;
    product: string;
    stock: number;
    category: string;
}

export default function InventoryList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("");

    // ✅ Mock Data — replace with API later
    const inventoryData: InventoryRecord[] = [
        { id: 1, product: "Laptop", stock: 35, category: "Electronics" },
        { id: 2, product: "Office Chair", stock: 8, category: "Furniture" },
        { id: 3, product: "USB Cable", stock: 120, category: "Accessories" },
        { id: 4, product: "Desk", stock: 0, category: "Furniture" },
    ];

    const filteredData = inventoryData.filter(
        (item) =>
            item.product.toLowerCase().includes(filter.toLowerCase()) ||
            item.category.toLowerCase().includes(filter.toLowerCase())
    );

    const stockStatus = (stock: number) => {
        if (stock <= 0) return <Tag value="Out of Stock" severity="danger" />;
        if (stock <= 10) return <Tag value="Low" severity="warning" />;
        return <Tag value="Available" severity="success" />;
    };

    const adjustButton = (row: InventoryRecord) => (
        <Button
            label="Adjust"
            icon="pi pi-pencil"
            text
            onClick={() => navigate(`/inventory/adjust?id=${row.id}`)}
        />
    );

    return (
        <Card title="Inventory Stock">
            <div className="flex justify-content-between mb-3">
                <h3 className="m-0">Products</h3>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Search Inventory..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </span>
            </div>

            <DataTable
                value={filteredData}
                paginator
                rows={5}
                scrollable
                emptyMessage="No inventory records found."
            >
                <Column field="product" header="Product" sortable />
                <Column field="category" header="Category" sortable />
                <Column field="stock" header="Stock" sortable />
                <Column
                    header="Status"
                    body={(row) => stockStatus(row.stock)}
                />
                <Column
                    header="Action"
                    body={adjustButton}
                    style={{ width: "120px" }}
                />
            </DataTable>
        </Card>
    );
}
