import { Card } from "primereact/card";
import { Chart } from "primereact/chart";

interface MonthlySalesData {
  month: string;
  total: number;
}

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((x) => x.month),
    datasets: [
      {
        label: "Monthly Sales ₹",
        backgroundColor: "#3B82F6",
        data: data.map((x) => x.total),
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card title="Monthly Sales">
      <div style={{ height: "250px" }}>
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default MonthlySalesChart;
