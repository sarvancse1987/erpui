import React from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

    const navigate = useNavigate();
    /* ================= SALES CHART ================= */
    const salesChartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Sales ₹",
                data: [120000, 150000, 180000, 140000, 200000, 230000],

                borderColor: "#2563EB", // Blue
                backgroundColor: "rgba(37, 99, 235, 0.15)",
                pointBackgroundColor: "#2563EB",
                pointBorderColor: "#ffffff",

                fill: true,
                tension: 0.4
            }
        ]
    };

    const salesChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: "#64748B" },
                grid: { color: "#E5E7EB" }
            },
            y: {
                ticks: { color: "#64748B" },
                grid: { color: "#E5E7EB" }
            }
        }
    };

    return (
        <div className="p-4">

            {/* ================= HEADER ================= */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">

                </h2>
                <Button label="Add Sale" icon="pi pi-plus" onClick={() => navigate("/sales")} className="p-button-sm custom-xs" />
            </div>

            {/* ================= KPI CARDS ================= */}
            <div className="grid mb-4">
                <KpiCard
                    title="Total Products"
                    value="120"
                    icon="pi pi-box"
                    color="blue"
                />
                <KpiCard
                    title="Total Sales"
                    value="₹ 5,80,000"
                    icon="pi pi-wallet"
                    color="green"
                />
                <KpiCard
                    title="Monthly Sales"
                    value="18"
                    icon="pi pi-clock"
                    color="orange"
                />
                <KpiCard
                    title="Stock Items"
                    value="450"
                    icon="pi pi-database"
                    color="teal"
                />
                <KpiCard
                    title="Pending Orders"
                    value="18"
                    icon="pi pi-clock"
                    color="orange"
                />

            </div>

            {/* ================= CHART + INVENTORY ================= */}
            <div className="grid mb-4">

                {/* SALES CHART */}
                <div className="col-12 md:col-8">
                    <Card title="Sales Overview" className="shadow-2">
                        <div style={{ height: "150px" }}>
                            <Chart
                                type="line"
                                data={salesChartData}
                                options={salesChartOptions}
                            />
                        </div>
                    </Card>
                </div>

                {/* INVENTORY SUMMARY */}
                <div className="col-12 md:col-4">
                    <Card title="Inventory Summary" className="shadow-2">
                        <div className="flex justify-content-between mb-3">
                            <span>Low Stock Items</span>
                            <strong className="text-orange-500">12</strong>
                        </div>
                        <div className="flex justify-content-between mb-3">
                            <span>Out of Stock</span>
                            <strong className="text-red-600">5</strong>
                        </div>
                        <div className="flex justify-content-between">
                            <span>Total Stock Value</span>
                            <strong className="text-green-600">
                                ₹ 3,40,000
                            </strong>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ================= RECENT ACTIVITY ================= */}
            <div className="grid">

                {/* RECENT ORDERS */}
                <div className="col-12 md:col-6">
                    <Card title="Recent Orders" className="shadow-2">
                        <ul className="list-none p-0 m-0">
                            <li className="mb-2 font-medium">
                                Order #1023 – ₹ 12,000
                            </li>
                            <li className="mb-2">
                                Order #1022 – ₹ 8,500
                            </li>
                            <li>
                                Order #1021 – ₹ 4,200
                            </li>
                        </ul>
                    </Card>
                </div>

                {/* ALERTS */}
                <div className="col-12 md:col-6">
                    <Card title="Alerts" className="shadow-2">
                        <ul className="list-none p-0 m-0">
                            <li className="mb-2 text-red-600 font-medium">
                                ⚠ Low stock: Rice
                            </li>
                            <li className="mb-2 text-orange-500">
                                ⏳ Payment pending
                            </li>
                            <li className="text-green-600">
                                ✔ New order received
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>

        </div>
    );
}

/* ================= KPI CARD COMPONENT ================= */

const colorMap: any = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-500",
    red: "text-red-600",
    teal: "text-teal-600"
};

const KpiCard = ({ title, value, icon, color }: any) => (
    <div className="col-12 md:col-2">
        <Card className="shadow-1">
            <div className="flex align-items-center justify-content-between">
                <div>
                    <div className="text-sm text-gray-500">
                        {title}
                    </div>
                    <div className={`text-xl font-bold mt-2 ${colorMap[color]}`}>
                        {value}
                    </div>
                </div>
                <i className={`${icon} text-3xl ${colorMap[color]}`} />
            </div>
        </Card>
    </div>
);
