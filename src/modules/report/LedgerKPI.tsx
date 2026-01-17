// File: src/components/LedgerKPI.tsx
import React from "react";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";

interface LedgerKPIProps {
  data: {
    totalCustomers: number;
    totalCredit: number;
    totalDebit: number;
    totalClosing: number;
  };
}

const LedgerKPI: React.FC<LedgerKPIProps> = ({ data }) => {
  return (
    <div className="grid mb-4">
      <div className="col-12 md:col-3">
        <Card title="Total Customers">{data.totalCustomers}</Card>
      </div>
      <div className="col-12 md:col-3">
        <Card title="Total Credit">{data.totalCredit.toFixed(2)}</Card>
      </div>
      <div className="col-12 md:col-3">
        <Card title="Total Debit">{data.totalDebit.toFixed(2)}</Card>
      </div>
      <div className="col-12 md:col-3">
        <Card title="Total Closing Bal">
          <ProgressBar
            value={(data.totalClosing / data.totalCredit) * 100}
            showValue
            style={{ height: "20px" }}
          />
        </Card>
      </div>
    </div>
  );
};

export default LedgerKPI;
