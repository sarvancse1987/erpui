import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { MostSoldProductModel } from "../../models/dashboard/MostSoldProductModel";

const MostSoldProductsBarChart = () => {
    const [chartData, setChartData] = useState<any>(null);
    const [chartOptions, setChartOptions] = useState<any>(null);

    useEffect(() => {
        apiService.get("/Dashboard/GetMostSoldProductsLast12Months")
            .then((res: any) => {

                const products: MostSoldProductModel[] = res.mostSoldProducts || [];
                const documentStyle = getComputedStyle(document.documentElement);

                setChartData({
                    labels: products.map(p => p.productName),
                    datasets: [
                        {
                            label: "Quantity Sold",
                            data: products.map(p => p.totalQuantitySold),
                            backgroundColor: documentStyle.getPropertyValue("--blue-500"),
                            borderRadius: 6,
                        },
                        {
                            label: "Profit (₹)",
                            data: products.map(p => p.totalProfit),
                            backgroundColor: documentStyle.getPropertyValue("--green-500"),
                            borderRadius: 6,
                        }
                    ]
                });

                setChartOptions({
                    indexAxis: "y", // Horizontal bar
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: documentStyle.getPropertyValue("--text-color"),
                            },
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: documentStyle.getPropertyValue("--text-color-secondary"),
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
        <Chart
            type="bar"
            data={chartData}
            options={chartOptions}
            className="w-full h-full"
        />
    );
};

export default MostSoldProductsBarChart;
