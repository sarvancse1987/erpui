import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import { useVoiceCommands } from "../speecherp/useVoiceCommands"; // <-- correct path
/* ================= TYPES ================= */

interface KpiCardProps {
    title: string;
    value: string | number | null | undefined;
    icon: string;
    color: "blue" | "green" | "orange" | "teal" | "red";
}

/* ================= DASHBOARD ================= */

export default function Dashboard() {
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [dashboardSummary, setDashboardSummary] = useState<any>(null);
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

    const chartData = useMemo(
        () => ({
            labels: salesSummary.map(x => x.monthName),
            datasets: [
                {
                    label: "Sales ₹",
                    data: salesSummary.map(x => x.totalSalesAmount ?? 0),
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
                <h2 className="text-2xl font-semibold">Dashboard</h2>

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
                <KpiCard title="Total Products" value={dashboardSummary?.activeProductsCount} icon="pi pi-box" color="blue" />
                <KpiCard title="Total Sales" value={formatINR(dashboardSummary?.totalSalesAmount)} icon="pi pi-wallet" color="green" />
                <KpiCard title="Monthly Sales" value={formatINR(dashboardSummary?.last30DaysSalesAmount)} icon="pi pi-clock" color="orange" />
                <KpiCard title="Stock Items" value={dashboardSummary?.totalStockItems} icon="pi pi-database" color="teal" />
                <KpiCard title="Customer Balance" value={formatINR(dashboardSummary?.customerBalanceAmount)} icon="pi pi-wallet" color="red" />
            </div>

            {/* CHART */}
            <Card title="Sales Overview">
                <div style={{ height: 200 }}>
                    <Chart type="line" data={chartData} options={chartOptions} />
                </div>
            </Card>
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
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => (
    <div className="col-12 md:col-2">
        <Card style={{ borderLeft: `5px solid ${borderColorMap[color]}` }}>
            <div className="flex justify-content-between">
                <div>
                    <div className="text-sm">{title}</div>
                    <div className="text-xl font-bold">{value}</div>
                </div>
                <i className={`${icon} text-3xl`} />
            </div>
        </Card>
    </div>
);
