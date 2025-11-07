import React from "react";

export default function Dashboard() {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-3">Dashboard</h2>

            <div className="grid">
                <div className="col-12 md:col-4">
                    <div className="p-4 border-round shadow-2 surface-card">
                        <h3>Total Products</h3>
                        <span className="text-xl font-bold">120</span>
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="p-4 border-round shadow-2 surface-card">
                        <h3>Total Sales</h3>
                        <span className="text-xl font-bold">₹ 5,80,000</span>
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="p-4 border-round shadow-2 surface-card">
                        <h3>Stock Items</h3>
                        <span className="text-xl font-bold">450</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-4 border-round surface-card shadow-2">
                <p>Welcome to the ERP Dashboard ✅</p>
            </div>
        </div>
    );
}
