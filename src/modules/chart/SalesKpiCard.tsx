import React from "react";
import { Card } from "primereact/card";

interface SalesKpiCardProps {
    title: string;
    value: string | number | null | undefined;
    icon: string;
    color: "blue" | "green" | "orange" | "teal" | "red";
}

/* ================= BORDER COLOR MAP ================= */
const borderColorMap: Record<string, string> = {
    blue: "#3B82F6",
    green: "#22C55E",
    orange: "#F97316",
    teal: "#14B8A6",
    red: "#EF4444",
};

/* ================= SALES KPI CARD ================= */
const SalesKpiCard: React.FC<SalesKpiCardProps> = ({ title, value, icon, color }) => (
    <div className="col-12 md:col-2 mb-3">
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

export default SalesKpiCard;
