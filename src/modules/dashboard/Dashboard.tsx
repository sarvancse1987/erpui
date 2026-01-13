import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { useVoiceCommands } from "../speecherp/useVoiceCommands"; // <-- correct path
import apiService from "../../services/apiService";
import Last12MonthsBarChart from "./Last12MonthsBarChart";
import MostSoldProductsBarChart from "./MostSoldProductsBarChart";
import MostBoughtCustomersBarChart from "./TopCustomersBarChart";
import TopCustomersBarChart from "./TopCustomersBarChart";
/* ================= TYPES ================= */

interface KpiCardProps {
    title: string;
    value: string | number | null | undefined;
    icon: string;
    color: "blue" | "green" | "orange" | "teal" | "red" | "purple" | "cyan";
}

/* ================= DASHBOARD ================= */

export default function Dashboard() {
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [dashboardSummary, setDashboardSummary] = useState<any>({});
    const [salesSummary, setSalesSummary] = useState<any[]>([]);

    /* ================= VOICE COMMANDS ================= */

    const commands = useVoiceCommands();

    const {
        listening,
        transcript,
        browserSupportsSpeechRecognition,
        resetTranscript,
    } = useSpeechRecognition({ commands });

    /* ================= VOICE CONTROL ================= */

    const toggleVoice = () => {
        if (!browserSupportsSpeechRecognition) {
            toast.current?.show({
                severity: "error",
                summary: "Not Supported",
                detail: "Voice recognition not supported in this browser",
            });
            return;
        }

        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({
                continuous: false,
                language: "en-IN",
            });
        }
    };

    /* ================= API ================= */

    useEffect(() => {
        apiService.get("/Dashboard").then(r => setDashboardSummary(r?.summary));
        apiService
            .get("/Dashboard/salesummary")
            .then(r => setSalesSummary(r?.saleSummary ?? []));
    }, []);

    /* ================= CHART ================= */


    /* ================= DUMMY DATA ================= */

    // const [dashboardSummary] = useState({
    //     activeProductsCount: 125,
    //     totalSalesAmount: 458900,
    //     last30DaysSalesAmount: 124500,
    //     totalStockItems: 560,
    //     customerBalanceAmount: 98000,
    // });

    // const [salesSummary] = useState([
    //     { monthName: "Jan", totalSalesAmount: 85000 },
    //     { monthName: "Feb", totalSalesAmount: 92000 },
    //     { monthName: "Mar", totalSalesAmount: 110000 },
    //     { monthName: "Apr", totalSalesAmount: 78000 },
    //     { monthName: "May", totalSalesAmount: 94000 },
    // ]);



    const [salesKpi] = useState({
        totalBills: 312,
        totalSales: 458900,
        totalGST: 82450,
        cash: 185000,
        upi: 273900,
    });

    /* ================= CHART ================= */

    const chartData = useMemo(
        () => ({
            labels: salesSummary.map(x => x.monthName),
            datasets: [
                {
                    label: "Sales ₹",
                    data: salesSummary.map(x => x.totalSalesAmount),
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37,99,235,0.15)",
                    fill: true,
                    tension: 0.4,
                },
            ],
        }),
        [salesSummary]
    );

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
    };

    const formatINR = (value?: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(value ?? 0);

    /* ================= UI ================= */

    return (
        <div className="p-4">
            <Toast ref={toast} />

            {/* HEADER */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-2xl font-semibold"></h2>

                <div className="flex align-items-center gap-2">
                    <Button
                        icon={listening ? "pi pi-stop" : "pi pi-microphone"}
                        className={`p-button-rounded ${listening ? "p-button-warning" : "p-button-danger"
                            }`}
                        onClick={toggleVoice}
                        tooltip={listening ? "Stop Listening" : "Voice Command"}
                    />

                    <Button
                        label="Add Sale"
                        icon="pi pi-plus"
                        className="p-button-info"
                        onClick={() => navigate("/sales")}
                    />
                </div>
            </div>

            {/* DEBUG – REMOVE LATER */}
            <div className="mb-3 text-sm text-gray-500">
                🎙 Listening: <b>{listening ? "YES" : "NO"}</b> <br />
                🗣 Transcript: <b>{transcript}</b>
            </div>

            {/* KPI CARDS */}
            <div className="grid mb-4">
                {/* ROW 1: Products & Stock */}
                <KpiCard title="Total Products" value={dashboardSummary.totalProducts} icon="pi pi-box" color="blue" />
                <KpiCard title="Stock Items" value={dashboardSummary.stockItems} icon="pi pi-database" color="teal" />
                <KpiCard title="Total Inventory Value" value={formatINR(dashboardSummary.totalInventoryValue)} icon="pi pi-box" color="green" />

                {/* ROW 2: Sales */}
                <KpiCard title="Total Bills" value={formatINR(dashboardSummary.totalBills)} icon="pi pi-list" color="purple" />
                <KpiCard title="Total Sales" value={formatINR(dashboardSummary.totalSales)} icon="pi pi-wallet" color="green" />
                <KpiCard title="Total Gst" value={formatINR(dashboardSummary.totalGST)} icon="pi pi-tag" color="cyan" />
                <KpiCard title="Total Sales Today" value={formatINR(dashboardSummary.totalSalesToday)} icon="pi pi-calendar" color="orange" />
                <KpiCard title="Total Purchases Today" value={formatINR(dashboardSummary.totalPurchasesToday)} icon="pi pi-shopping-cart" color="purple" />

                {/* ROW 3: Customers & Suppliers */}
                <KpiCard title="Total Customers" value={dashboardSummary.totalCustomers} icon="pi pi-users" color="blue" />
                <KpiCard title="Total Suppliers" value={dashboardSummary.totalSuppliers} icon="pi pi-briefcase" color="teal" />
                <KpiCard title="Customer Balance" value={formatINR(dashboardSummary.customerBalance)} icon="pi pi-wallet" color="red" />
                {/* <KpiCard title="Outstanding Customer Balance" value={formatINR(dashboardSummary.outstandingCustomerBalance)} icon="pi pi-wallet" color="red" /> */}

                {/* ROW 4: Cash & Payments */}
                <KpiCard title="Cash" value={formatINR(dashboardSummary.cash)} icon="pi pi-money-bill" color="green" />
                <KpiCard title="UPI" value={formatINR(dashboardSummary.upi)} icon="pi pi-credit-card" color="cyan" />
                <KpiCard title="Cash In Hand" value={formatINR(dashboardSummary.cashInHand)} icon="pi pi-wallet" color="orange" />
            </div>

            <Card
                title="Sales Overview"
                className="mb-4 p-3 shadow-2 border-round"
            >
                <div style={{ height: '220px' }}>
                    <Last12MonthsBarChart />
                </div>
            </Card>

            {/* PAYMENT SPLIT + KPI */}
            <div className="grid mt-3">

                {/* PAYMENT SPLIT */}
                <div className="col-12 md:col-6">
                    <Card title="Payment Split" className="p-3 shadow-1 border-round">
                        <div
                            style={{
                                height: '260px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Chart
                                type="doughnut"
                                data={{
                                    labels: ["Cash", "UPI", "Credit"],
                                    datasets: [
                                        {
                                            data: [
                                                dashboardSummary?.cash ?? 0,
                                                dashboardSummary?.upi ?? 0,
                                                dashboardSummary?.customerBalance ?? 0
                                            ],
                                            backgroundColor: ["#22C55E", "#3B82F6", "#F59E0B"],
                                            hoverBackgroundColor: ["#16A34A", "#2563EB", "#D97706"],
                                        },
                                    ],
                                }}
                                options={{
                                    cutout: "65%",
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: "bottom",
                                            labels: { padding: 15 }
                                        },
                                    },
                                }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </Card>
                </div>

                {/* SALES KPI */}
                <div className="col-12 md:col-6">
                    <Card title="Most Sold Products" className="p-3 shadow-1 border-round h-full">
                        <div style={{ height: "260px" }}>
                            <MostSoldProductsBarChart />
                        </div>
                    </Card>
                </div>

            </div>

            <div className="col-12 md:col-6">
                <Card
                    title="Top Customers by Purchase"
                    className="p-3 shadow-1 border-round"
                >
                    <div style={{ height: 280 }}>
                        <TopCustomersBarChart />
                    </div>
                </Card>
            </div>

        </div>
    );
}

/* ================= KPI CARD ================= */

const borderColorMap: Record<string, string> = {
    blue: "#3B82F6",
    green: "#22C55E",
    orange: "#F97316",
    teal: "#14B8A6",
    red: "#EF4444",
    purple: "#8B5CF6",
    cyan: "#06B6D4",
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => (
    <div className="col-12 md:col-2">
        <Card style={{ borderLeft: `5px solid ${borderColorMap[color]}` }}>
            <div className="flex justify-content-between align-items-center">
                <div>
                    <div className="text-sm">{title}</div>
                    <div className="text-xl font-bold">{value}</div>
                </div>
                <i className={`${icon} text-3xl`} />
            </div>
        </Card>
    </div>
);
