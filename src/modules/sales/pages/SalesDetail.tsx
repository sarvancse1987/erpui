import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

interface SaleItem {
    product: string;
    quantity: number;
    price: number;
}

interface SaleDetail {
    id: number;
    customer: string;
    date: string;
    status: "PAID" | "PENDING" | "CANCELLED";
    totalAmount: number;
    items: SaleItem[];
}

export default function SalesDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // ✅ Mock data — replace with API call
    const saleData: SaleDetail = {
        id: Number(id),
        customer: "John Doe",
        date: "2025-10-01",
        status: "PAID",
        totalAmount: 4500,
        items: [
            { product: "Laptop Bag", quantity: 2, price: 1500 },
            { product: "USB Cable", quantity: 3, price: 500 },
        ],
    };

    const statusSeverity =
        saleData.status === "PAID"
            ? "success"
            : saleData.status === "PENDING"
                ? "warning"
                : "danger";

    const footer = (
        <div className="text-right font-semibold">
            Total Amount: ₹{saleData.totalAmount.toLocaleString("en-IN")}
        </div>
    );

    return (
        <div className="p-fluid">
            {/* Header Section */}
            <Card
                title={`Sales Detail - #${saleData.id}`}
                subTitle={`Invoice Date: ${saleData.date}`}
                className="mb-3"
            >
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <h4>Customer</h4>
                        <p>{saleData.customer}</p>
                    </div>

                    <div className="col-12 md:col-6">
                        <h4>Status</h4>
                        <Tag value={saleData.status} severity={statusSeverity}></Tag>
                    </div>
                </div>

                <Button
                    label="Back to Sales"
                    icon="pi pi-arrow-left"
                    className="mt-3"
                    onClick={() => navigate("/sales")}
                />
            </Card>

            {/* Item List */}
            <Card title="Items">
                <DataTable value={saleData.items} footer={footer}>
                    <Column field="product" header="Product"></Column>
                    <Column field="quantity" header="Qty"></Column>
                    <Column
                        field="price"
                        header="Price (₹)"
                        body={(row) => row.price.toLocaleString("en-IN")}
                    ></Column>
                    <Column
                        header="Subtotal (₹)"
                        body={(row) =>
                            (row.quantity * row.price).toLocaleString("en-IN")
                        }
                    ></Column>
                </DataTable>
            </Card>
        </div>
    );
}
