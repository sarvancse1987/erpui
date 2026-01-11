import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import apiService from "../../services/apiService";

export interface TopCustomerDto {
    customerName: string;
    totalBills: number;
    totalPurchaseAmount: number;
    outstandingBalance: number;
}

const TopCustomersBarChart = () => {
    const [chartData, setChartData] = useState<any>(null);
    const [chartOptions, setChartOptions] = useState<any>(null);

    useEffect(() => {
        apiService
            .get("/Dashboard/GetTopCustomersByPurchaseAmount") // your API endpoint
            .then((res: { topCustomers: TopCustomerDto[] }) => {
                const customers = res.topCustomers ?? [];

                const documentStyle = getComputedStyle(document.documentElement);

                setChartData({
                    labels: customers.map(c => c.customerName),
                    datasets: [
                        {
                            label: "Total Purchase Amount",
                            data: customers.map(c => c.totalPurchaseAmount),
                            backgroundColor: documentStyle.getPropertyValue("--blue-500"),
                            borderRadius: 4,
                        },
                        {
                            label: "Outstanding Balance",
                            data: customers.map(c => c.outstandingBalance),
                            backgroundColor: documentStyle.getPropertyValue("--orange-500"),
                            borderRadius: 4,
                        },
                    ],
                });

                setChartOptions({
                    indexAxis: "y", // horizontal bar chart
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: documentStyle.getPropertyValue("--text-color"),
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context: any) {
                                    return `${context.dataset.label}: ₹${context.raw.toLocaleString()}`;
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: documentStyle.getPropertyValue("--text-color-secondary"),
                                beginAtZero: true,
                            },
                            grid: {
                                color: documentStyle.getPropertyValue("--surface-border"),
                            },
                        },
                        y: {
                            ticks: {
                                color: documentStyle.getPropertyValue("--text-color-secondary"),
                            },
                            grid: {
                                display: false,
                            },
                        },
                    },
                });
            });
    }, []);

    return (
        <div style={{ height: "350px" }}>
            {chartData && <Chart type="bar" data={chartData} options={chartOptions} />}
        </div>
    );
};

export default TopCustomersBarChart;
