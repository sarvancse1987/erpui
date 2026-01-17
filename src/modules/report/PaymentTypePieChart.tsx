import { Card } from "primereact/card";
import { Chart } from "primereact/chart";

interface PaymentTypeData {
  type: string;
  amount: number;
}

interface PaymentTypePieChartProps {
  data: PaymentTypeData[];
}

const PaymentTypePieChart: React.FC<PaymentTypePieChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((x) => x.type),
    datasets: [
      {
        data: data.map((x) => x.amount),
        backgroundColor: ["#22C55E", "#3B82F6", "#F59E0B"],
        hoverBackgroundColor: ["#16A34A", "#2563EB", "#D97706"],
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const value = tooltipItem.raw ?? 0;
            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
  };

  return (
    <Card title="Payment Type Distribution">
      <div style={{ height: "250px" }}>
        <Chart type="doughnut" data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default PaymentTypePieChart;
