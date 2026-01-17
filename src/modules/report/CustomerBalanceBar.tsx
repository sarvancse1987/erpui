import React from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { CustomerLedgerModel } from "../../models/CustomerLedgerModel";

// Aggregate ledger data per unique customer
const aggregateByCustomer = (ledger: CustomerLedgerModel[]) => {
  const map: Record<string, CustomerLedgerModel> = {};

  ledger.forEach((l) => {
    if (!map[l.customerName]) {
      map[l.customerName] = { ...l }; // copy first entry
    } else {
      // sum numeric fields
      map[l.customerName].credit += l.credit ?? 0;
      map[l.customerName].debit += l.debit ?? 0;
      map[l.customerName].closingBalance += l.closingBalance ?? 0;
    }
  });

  return Object.values(map);
};

interface CustomerBalanceBarProps {
  ledger: CustomerLedgerModel[];
}

const CustomerBalanceBar: React.FC<CustomerBalanceBarProps> = ({ ledger }) => {
  const aggregatedLedger = aggregateByCustomer(ledger);

  const chartData = {
    labels: aggregatedLedger.map((l) => l.customerName),
    datasets: [
      {
        label: "Credit",
        data: aggregatedLedger.map((l) => l.credit ?? 0),
        backgroundColor: "#22C55E",
      },
      {
        label: "Debit",
        data: aggregatedLedger.map((l) => l.debit ?? 0),
        backgroundColor: "#EF4444",
      },
      {
        label: "Closing Balance",
        data: aggregatedLedger.map((l) => l.closingBalance ?? 0),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return (
    <Card title="Customer Balances">
      <div style={{ height: "300px" }}>
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default CustomerBalanceBar;
