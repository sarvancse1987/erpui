import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";

interface InventoryRecord {
    id: number;
    product: string;
    stock: number;
}

export default function InventoryAdjust() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const itemId = Number(params.get("id"));

    const [item, setItem] = useState<InventoryRecord | null>(null);
    const [adjustQty, setAdjustQty] = useState<number | null>(null);
    const [notes, setNotes] = useState("");

    // ✅ Mock: Replace API fetch later
    const mockData: InventoryRecord[] = [
        { id: 1, product: "Laptop", stock: 35 },
        { id: 2, product: "Office Chair", stock: 8 },
        { id: 3, product: "USB Cable", stock: 120 },
        { id: 4, product: "Desk", stock: 0 },
    ];

    useEffect(() => {
        const selected = mockData.find((x) => x.id === itemId);
        if (selected) setItem(selected);
    }, [itemId]);

    const handleSubmit = () => {
        if (!adjustQty || notes.trim() === "") {
            alert("Please enter adjustment quantity and notes!");
            return;
        }

        console.log("Stock Adjustment Saved: ", {
            ...item,
            adjustedStock: item!.stock + adjustQty,
            notes,
        });

        navigate("/inventory");
    };

    if (!item) return <p>Loading inventory...</p>;

    return (
        <Card title="Adjust Inventory">
            <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-6">
                    <label>Product</label>
                    <InputTextarea value={item.product} disabled autoResize />
                </div>

                <div className="field col-12 md:col-6">
                    <label>Current Stock</label>
                    <InputNumber value={item.stock} disabled />
                </div>

                <div className="field col-12 md:col-6">
                    <label>Adjustment Quantity</label>
                    <InputNumber
                        value={adjustQty}
                        //onValueChange={(e) => setAdjustQty(e.value)}
                    />
                    <small className="text-secondary">Enter + for add, - for reduce</small>
                </div>

                <div className="field col-12">
                    <label>Reason / Notes</label>
                    <InputTextarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        autoResize
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
                <Button
                    label="Cancel"
                    severity="secondary"
                    onClick={() => navigate("/inventory")}
                />
                <Button
                    label="Save Adjustment"
                    icon="pi pi-check"
                    severity="success"
                    onClick={handleSubmit}
                />
            </div>
        </Card>
    );
}
