import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import apiService from '../../services/apiService';

export default function Last12MonthsBarChart() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        apiService.get('/Dashboard/GetLast12MonthsSales').then(res => {
            // Ensure we have a proper array from API
            const data = res?.last12MonthsSales ?? [];

            // Map labels and datasets
            const labels = data.map((x: any) => x.monthLabel);
            const totalSale = data.map((x: any) => x.totalSale ?? 0);
            const cashUpi = data.map((x: any) => x.cashUpi ?? 0);
            const credit = data.map((x: any) => x.credit ?? 0);

            const documentStyle = getComputedStyle(document.documentElement);

            // Set chart data
            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Total Sale',
                        backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                        borderColor: documentStyle.getPropertyValue('--blue-500'),
                        data: totalSale
                    },
                    {
                        label: 'Cash + UPI',
                        backgroundColor: documentStyle.getPropertyValue('--green-500'),
                        borderColor: documentStyle.getPropertyValue('--green-500'),
                        data: cashUpi
                    },
                    {
                        label: 'Balance',
                        backgroundColor: documentStyle.getPropertyValue('--orange-500'),
                        borderColor: documentStyle.getPropertyValue('--orange-500'),
                        data: credit
                    }
                ]
            });

            // Set chart options
            setChartOptions({
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                    legend: {
                        labels: { color: documentStyle.getPropertyValue('--text-color') }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: documentStyle.getPropertyValue('--text-color-secondary'), font: { weight: 500 } },
                        grid: { display: false, drawBorder: false }
                    },
                    y: {
                        ticks: { color: documentStyle.getPropertyValue('--text-color-secondary') },
                        grid: { drawBorder: false, color: documentStyle.getPropertyValue('--surface-border') }
                    }
                }
            });
        }).catch((err) => {
            console.error("Error fetching last 12 months sales:", err);
            // Optionally: reset chart to empty
            setChartData({ labels: [], datasets: [] });
        });
    }, []);


    return (
        <div
            style={{
                height: '100%',
                minHeight: '220px',
                position: 'relative',
            }}
        >
            <Chart
                type="bar"
                data={chartData}
                options={{
                    ...chartOptions,
                    maintainAspectRatio: false
                }}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );

}
