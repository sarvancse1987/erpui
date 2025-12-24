import React, { useEffect, useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";
import { DashboardSummaryModel } from "../../models/dashboard/DashboardSummaryModel";
import { DashboardSaleSummaryModel } from "../../models/dashboard/DashboardSaleSummaryModel";

interface KpiCardProps {
    title: string;
    value: string | number | null | undefined;
    icon: string;
    color: "blue" | "green" | "orange" | "teal" | "red";
    route?: string;
}

export default function Dashboard() {

    const navigate = useNavigate();

    const [dashboardSummaryCount, setDashboardSummaryCount] = useState<DashboardSummaryModel | null>(null);
    const [dashboardSaleSummaryCount, setDashboardSaleSummaryCount] = useState<DashboardSaleSummaryModel[] | []>([]);

    const fetchSummary = async () => {
        try {
            const response = await apiService.get("/Dashboard");
            if (response && response.summary) {
                setDashboardSummaryCount(response.summary);
            }
        } catch (error) {

        }
    };

    const fetchSaleSummary = async () => {
        try {
            const response = await apiService.get("/Dashboard/salesummary");
            if (response && response.saleSummary) {
                setDashboardSaleSummaryCount(response.saleSummary);
            }
        } catch (error) {

        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            await Promise.all([
                fetchSummary(),
                fetchSaleSummary()
            ]);
        };

        loadDashboardData();
    }, []);

    const salesSummaryChartData = useMemo(() => {
        const labels = dashboardSaleSummaryCount.map(x => x.monthName);
        const data = dashboardSaleSummaryCount.map(x => x.totalSalesAmount ?? 0);

        return {
            labels,
            datasets: [
                {
                    label: "Sales ₹",
                    data,

                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37, 99, 235, 0.15)",
                    pointBackgroundColor: "#2563EB",
                    pointBorderColor: "#ffffff",

                    fill: true,
                    tension: 0.4
                }
            ]
        };
    }, [dashboardSaleSummaryCount]);


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

    const formatINR = (value?: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value ?? 0);

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
                    value={dashboardSummaryCount?.activeProductsCount}
                    icon="pi pi-box"
                    color="blue"
                    route="/products"
                />
                <KpiCard
                    title="Total Sales"
                    value={formatINR(dashboardSummaryCount?.totalSalesAmount)}
                    icon="pi pi-wallet"
                    color="green"
                    route="/sales"
                />
                <KpiCard
                    title="Monthly Sales"
                    value={formatINR(dashboardSummaryCount?.last30DaysSalesAmount)}
                    icon="pi pi-clock"
                    color="orange"
                    route="/sales?filter=last30days"
                />
                <KpiCard
                    title="Stock Items"
                    value={dashboardSummaryCount?.totalStockItems}
                    icon="pi pi-database"
                    color="teal"
                    route="/inventory"
                />
                <KpiCard
                    title="Customer Balance"
                    value={formatINR(dashboardSummaryCount?.customerBalanceAmount)}
                    icon="pi pi-wallet"
                    color="red"
                    route="/ledger"
                />
                <KpiCard
                    title="Pending Orders"
                    value="18"
                    icon="pi pi-clock"
                    color="orange"
                    route="/orders?status=pending"
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
                                data={salesSummaryChartData}
                                options={salesChartOptions}
                            />
                        </div>
                    </Card>
                </div>

                {/* INVENTORY SUMMARY */}
                <div className="col-12 md:col-4">
                    <Card title="Inventory Summary" className="shadow-2">
                        <div className="flex justify-content-between mb-6">
                            <span>Low Stock Items</span>
                            <strong className="text-orange-500"> {dashboardSummaryCount?.lowStockItems ?? 0}</strong>
                        </div>
                        <div className="flex justify-content-between mb-7">
                            <span>Out of Stock</span>
                            <strong className="text-red-600">{dashboardSummaryCount?.outOfStockItems ?? 0}</strong>
                        </div>
                        <div className="flex justify-content-between">
                            <span>Total Stock Value</span>
                            <strong className="text-green-600">
                                {formatINR(dashboardSummaryCount?.totalStockValue)}
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

const borderColorMap: Record<string, string> = {
    blue: "#3B82F6",     // blue-500
    green: "#22C55E",    // green-500
    orange: "#F97316",   // orange-500
    teal: "#14B8A6",     // teal-500
    red: "#EF4444",      // red-500
};


const KpiCard: React.FC<KpiCardProps> = ({
    title,
    value,
    icon,
    color,
    route = '/products'
}) => {
    const navigate = useNavigate();

    return (
        <div className="col-12 md:col-2">
            <Card
                className="shadow-1 cursor-pointer hover:shadow-3 transition-shadow"
                style={{ borderLeft: `5px solid ${borderColorMap[color]}` }}
                onClick={() => window.open(route, "_blank")}
            >
                <div className="flex align-items-center justify-content-between">
                    <div>
                        <div className="text-sm text-gray-500">{title}</div>
                        <div
                            className="text-xl font-bold mt-2"
                            style={{ color: borderColorMap[color] }}
                        >
                            {value}
                        </div>
                    </div>
                    <i
                        className={`${icon} text-3xl`}
                        style={{ color: borderColorMap[color] }}
                    />
                </div>
            </Card>
        </div>
    );
};
