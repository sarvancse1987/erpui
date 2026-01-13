import { useEffect, useState } from "react";
import { SaleModel } from "../../models/sale/SaleModel";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { customerNameTemplate } from "../../common/common";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { TReportTypeDatatable } from "../../components/TReportTypeDatatable";

const SalesSummary = () => {
  const [sales, setSales] = useState<SaleModel[]>([]);

  const loadAllData = async () => {
    try {
      const res = await apiService.get(`/Sale/saledetails`);
      const mapped = res.sale.map((p: any) => ({
        ...p,
        shipment: res.shipment.find((i: any) => i.saleId === p.saleId),
      }));
      setSales(mapped ?? []);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const columns: ColumnMeta<SaleModel>[] = [
    {
      field: "customerName",
      header: "Customer Name",
      width: "160px",
      frozen: true,
      body: (row: SaleModel) => customerNameTemplate(row.customerId, row.customerName ?? ""),
      exportValue: (row) => row.customerName ?? "",
    },
    { field: "saleRefNo", header: "Sale Ref No", width: "160px", exportValue: (row) => row.saleRefNo },
    { field: "saleOnDate", header: "Sale Date", width: "90px", exportValue: (row) => row.saleOnDate },
    {
      field: "paymentTypeName",
      header: "Sale Type",
      width: "90px",
      body: (row: SaleModel) => {
        const paymentType = row.paymentTypeName ?? "";
        let severity: "success" | "danger" | "warning" | "info" = "info";
        switch (paymentType.toLowerCase()) {
          case "cash": case "card": case "upi": case "mixed": case "bank": case "cheque": severity = "success"; break;
          case "credit": severity = "danger"; break;
          case "partial": severity = "warning"; break;
          default: severity = "info";
        }
        return <Tag value={paymentType} severity={severity} className="purchase-type-tag" style={{ width: "90px" }} />;
      },
      exportValue: (row) => row.paymentTypeName ?? "",
    },
    {
      field: "grandTotal",
      header: "Total",
      width: "100px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.grandTotal)}
          className="amount-tag"
          style={{ width: "90px", backgroundColor: "#3498db", color: "white" }}
        />
      ),
      exportValue: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.grandTotal),
    },
    {
      field: "cash",
      header: "Paid Amt",
      width: "100px",
      body: (row) => {
        const totalPaid = (row.cash ?? 0) + (row.upi ?? 0);
        return <Tag value={totalPaid} className="amount-tag" style={{ width: "130px" }} />;
      },
      exportValue: (row) => (row.cash ?? 0) + (row.upi ?? 0),
    },
    {
      field: "balanceAmount",
      header: "Bal Amt",
      width: "100px",
      body: (row) => {
        const paid = (row.cash ?? 0) + (row.upi ?? 0);
        const balance = row.paymentTypeName?.toLowerCase() === "credit" ? row.grandTotal : row.grandTotal - paid;
        return <Tag value={balance} className="amount-tag" style={{ width: "90px" }} />;
      },
      exportValue: (row) => {
        const paid = (row.cash ?? 0) + (row.upi ?? 0);
        return row.paymentTypeName?.toLowerCase() === "credit" ? row.grandTotal : row.grandTotal - paid;
      },
    },
    {
      field: "runningBalance",
      header: "Run Amt",
      width: "100px",
      body: (row) => {
        const balance = row.runningBalance ?? 0;
        return <Tag value={balance} className="amount-tag" style={{ width: "90px" }} />;
      },
      exportValue: (row) => row.runningBalance ?? 0,
    },
  ];


  return (
    <>
      <TReportTypeDatatable<SaleModel>
        data={sales}
        columns={columns}
        primaryKey="saleId"
        isDelete={false}
        isNew={false}
        isEdit={false}
        isSave={false}
        page="sale"
        showDateFilter={true}
        showDdlFilter={true}
      />
    </>
  )
};

export default SalesSummary;
