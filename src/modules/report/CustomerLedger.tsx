import { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { Tag } from "primereact/tag";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TReportTypeDatatable } from "../../components/TReportTypeDatatable";

interface CustomerLedgerModel {
  customerLedgerId: number;
  customerId: number;
  customerName: string;
  sourceType: string;
  ledgerType: "Dr" | "Cr";
  openingBalance: number;
  credit: number;
  debit: number;
  closingBalance: number;
  lastUpdated: string;
  lastUpdatedTime: string;
}

export default function CustomerLedger() {
  const [ledger, setLedger] = useState<CustomerLedgerModel[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);

  useEffect(() => {
    loadLedger();
  }, [customerId]);

  const loadLedger = async () => {
    const url = customerId
      ? `CustomerLedger/ledgerdetails/${customerId}`
      : `CustomerLedger/ledgerdetails`;

    const res = await apiService.get(url);
    setLedger(res.data ?? []);
  };

  /* =========================
      Column Templates
     ========================= */

  const typeTemplate = (row: CustomerLedgerModel) => (
    <Tag
      value={row.ledgerType}
      severity={row.ledgerType === "Dr" ? "danger" : "success"}
      style={{ width: "70px", textAlign: "center" }}
    />
  );

  const sourcetypeTemplate = (row: CustomerLedgerModel) => (
    <Tag
      value={row.sourceType}
      severity={row.sourceType === "Voucher" ? "success" : "danger"}
      style={{ width: "70px", textAlign: "center" }}
    />
  );

  const amountTag = (
    value: number,
    severity: "success" | "danger" | "info" | "warning" = "info"
  ) => (
    <Tag
      value={value.toFixed(2)}
      severity={severity}
      style={{ width: "90px", textAlign: "center" }}
    />
  );

  /* =========================
      Column Definitions
     ========================= */

  const columns: ColumnMeta<CustomerLedgerModel>[] = [
    {
      field: "customerName",
      header: "Customer Name",
      width: "180px",
      frozen: true,
      exportValue: (row) => row.customerName,
    },
    {
      field: "lastUpdated",
      header: "Date",
      width: "100px",
      exportValue: (row) => row.lastUpdated,
    },
    {
      field: "lastUpdatedTime",
      header: "Time",
      width: "90px",
      exportValue: (row) => row.lastUpdatedTime,
    },
    {
      field: "ledgerType",
      header: "Tran Type",
      width: "80px",
      body: typeTemplate,
      exportValue: (row) => row.ledgerType,
    },
    {
      field: "sourceType",
      header: "Entry Type",
      width: "80px",
      body: sourcetypeTemplate,
      exportValue: (row) => row.sourceType,
    },
    {
      field: "openingBalance",
      header: "Opening Bal",
      width: "110px",
      body: (row) =>
        amountTag(row.openingBalance ?? 0, row.openingBalance === 0 ? "success" : "danger"),
      exportValue: (row) => row.openingBalance ?? 0,
    },
    {
      field: "openingBalance",
      header: "Total",
      width: "100px",
      body: (row) => amountTag((row.credit ?? 0) + (row.debit ?? 0), "info"),
      exportValue: (row) => (row.credit ?? 0) + (row.debit ?? 0),
    },
    {
      field: "credit",
      header: "Credit",
      width: "100px",
      body: (row) => amountTag(row.credit ?? 0, "success"),
      exportValue: (row) => row.credit ?? 0,
    },
    {
      field: "debit",
      header: "Debit",
      width: "100px",
      body: (row) => amountTag(row.debit ?? 0, "danger"),
      exportValue: (row) => row.debit ?? 0,
    },
    {
      field: "closingBalance",
      header: "Closing Bal",
      width: "110px",
      body: (row) => amountTag(row.closingBalance ?? 0, "danger"),
      exportValue: (row) => row.closingBalance ?? 0,
    },
  ];

  return (
    <TReportTypeDatatable<CustomerLedgerModel>
      data={ledger}
      columns={columns}
      primaryKey="customerLedgerId"
      isNew={false}
      isSave={false}
      isDelete={false}
      isEdit={false}
      showDateFilter={true}
      showDdlFilter={true}
      page="customerledger"
    />
  );
}
