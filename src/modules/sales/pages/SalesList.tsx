import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";

interface SalesRecord {
  id: number;
  customer: string;
  date: string;
  amount: number;
  status: "PAID" | "PENDING" | "CANCELLED";
}

export default function SalesList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");

  const salesData: SalesRecord[] = [
    { id: 101, customer: "John Doe", date: "2025-10-01", amount: 4500, status: "PAID" },
    { id: 102, customer: "ACME Corp", date: "2025-10-03", amount: 15000, status: "PENDING" },
    { id: 103, customer: "Sarah Lee", date: "2025-10-10", amount: 7200, status: "CANCELLED" },
  ];

  const filteredData = salesData.filter(
    (r) =>
      r.customer.toLowerCase().includes(filter.toLowerCase()) ||
      r.id.toString().includes(filter)
  );

  const statusBody = (row: SalesRecord) => {
    const severity =
      row.status === "PAID"
        ? "success"
        : row.status === "PENDING"
        ? "warning"
        : "danger";
    return <Tag value={row.status} severity={severity}></Tag>;
  };

  const actionsBody = (row: SalesRecord) => (
    <Button
      icon="pi pi-eye"
      text
      onClick={() => navigate(`/sales/${row.id}`)}
    />
  );

  return (
    <Card title="Sales Transactions">
      <div className="flex justify-content-end mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Search sales..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </span>
      </div>

      <DataTable
        value={filteredData}
        paginator
        rows={5}
        scrollable
        emptyMessage="No sales found."
      >
        <Column field="id" header="ID" sortable></Column>
        <Column field="customer" header="Customer" sortable></Column>
        <Column field="date" header="Date" sortable></Column>
        <Column
          field="amount"
          header="Amount (₹)"
          sortable
          body={(row) => row.amount.toLocaleString("en-IN")}
        ></Column>
        <Column header="Status" body={statusBody}></Column>
        <Column header="Actions" body={actionsBody}></Column>
      </DataTable>
    </Card>
  );
}
