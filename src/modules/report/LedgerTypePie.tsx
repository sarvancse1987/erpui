import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { CustomerLedgerModel } from "../../models/CustomerLedgerModel";

const LedgerTypePie = ({ ledger }: { ledger: CustomerLedgerModel[] }) => {
  const totalDr = ledger.filter(l => l.ledgerType === "Dr").length;
  const totalCr = ledger.filter(l => l.ledgerType === "Cr").length;

  const data = {
    labels: ["Dr", "Cr"],
    datasets: [
      {
        data: [totalDr, totalCr],
        backgroundColor: ["#EF4444", "#22C55E"],
        hoverBackgroundColor: ["#B91C1C", "#15803D"],
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  return (
    <Card title="Ledger Type Distribution">
      <div style={{ height: "220px" }}>
        <Chart type="doughnut" data={data} options={options} />
      </div>
    </Card>
  );
};
export default LedgerTypePie;