import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

// Corrected component declaration
interface KPICardsProps {
  data: {
    totalSales: number;
    totalPaid: number;
    totalBalance: number;
  };
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => (
  <div className="grid mb-4">
    <div className="col-12 md:col-3">
      <Card title="Total Sales">{formatINR(data.totalSales)}</Card>
    </div>
    <div className="col-12 md:col-3">
      <Card title="Paid Amount">{formatINR(data.totalPaid)}</Card>
    </div>
    <div className="col-12 md:col-3">
      <Card title="Balance Amount">{formatINR(data.totalBalance)}</Card>
    </div>
    <div className="col-12 md:col-3">
      <Card title="Credit %">
        <ProgressBar value={(data.totalBalance / data.totalSales) * 100} showValue />
      </Card>
    </div>
  </div>
);

export default KPICards;
