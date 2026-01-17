import { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { Sidebar } from "primereact/sidebar";
import { Chart } from "primereact/chart";

interface PurchaseSummaryModel {
  purchaseId: number;
  purchaseRefNo: string;
  supplierName: string;
  invoiceNumber: string;
  purchaseDate: string;
  totalAmount: number;
  totalGST: number;
  grandTotal: number;
  paymentMode: string;
  totalItems: number;
}

export default function PurchaseSummary() {
  const [rows, setRows] = useState<PurchaseSummaryModel[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseSummaryModel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =======================
  // LOAD DATA
  // =======================
  const loadData = async () => {
    const res = await apiService.getQueryParam("/Report/GetPurchaseSummaryReport");
    if (res && res.status) {
      const data = res?.purchaseSummary ?? [];
      setRows(data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =======================
  // TABLE COLUMNS
  // =======================
  const columns: ColumnMeta<PurchaseSummaryModel>[] = [
    { field: "supplierName", header: "Supplier", width: "200px" },
    { field: "invoiceNumber", header: "Invoice No", width: "160px" },
    { field: "purchaseDate", header: "Date", width: "150px" },
    {
      field: "totalAmount",
      header: "Total",
      width: "130px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(row.totalAmount)}
          style={{ backgroundColor: "#3498db", color: "white", fontWeight: 500, textAlign: "center", width: "120px" }}
        />
      ),
    },
    {
      field: "totalGST",
      header: "GST",
      width: "120px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(row.totalGST)}
          style={{ backgroundColor: "#f39c12", color: "white", fontWeight: 500, textAlign: "center", width: "120px" }}
        />
      ),
    },
    {
      field: "grandTotal",
      header: "Grand Total",
      width: "140px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(row.grandTotal)}
          style={{ backgroundColor: "#2ecc71", color: "white", fontWeight: 600, textAlign: "center", width: "140px" }}
        />
      ),
    },
    { field: "paymentMode", header: "Payment", width: "120px" },
    { field: "totalItems", header: "Items", width: "100px" },
  ];

  // =======================
  // HANDLERS
  // =======================
  const handleOpenDetails = (row: PurchaseSummaryModel) => {
    setSelectedPurchase(row);
    setIsSidebarOpen(true);
  };

  // =======================
  // CHART DATA
  // =======================
  const chartData = {
    labels: rows.map((r) => r.purchaseRefNo),
    datasets: [
      {
        label: "Grand Total",
        backgroundColor: "#2ecc71",
        data: rows.map((r) => r.grandTotal),
      },
      {
        label: "GST",
        backgroundColor: "#f39c12",
        data: rows.map((r) => r.totalGST),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ₹ ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Purchase Ref" } },
      y: { title: { display: true, text: "Amount (₹)" }, beginAtZero: true },
    },
  };

  // =======================
  // UI
  // =======================
  return (
    <>
      {/* SUMMARY CARDS */}
      <div className="grid p-1 mb-3">
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Purchases</h4>
            <h2>{rows.length}</h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Purchase Value</h4>
            <h2>
              ₹{" "}
              {rows.reduce((sum, x) => sum + x.grandTotal, 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Items Purchased</h4>
            <h2>{rows.length}</h2>
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="p-card p-2 shadow-1 border-round mb-4" style={{ height: "300px" }}>
        <h5>Purchase Summary</h5>
        <Chart type="bar" data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
      </div>

      {/* DATATABLE */}
      <TTypeDatatable<PurchaseSummaryModel>
        data={rows}
        columns={columns}
        primaryKey="purchaseId"
        onEdit={handleOpenDetails}
        isDelete={false}
        isNew={false}
        isEdit={false}
        isSave={false}
        page="purchasesummary"
        showDateFilter={true}
        showDdlFilter={false}
      />

      {/* SIDEBAR */}
      <Sidebar
        visible={isSidebarOpen}
        position="right"
        onHide={() => setIsSidebarOpen(false)}
        header="Purchase Details"
        style={{ width: "50rem" }}
      >
        {selectedPurchase ? (
          <div className="p-3 space-y-2">
            <h3 className="mb-2">{selectedPurchase.purchaseRefNo}</h3>
            <p>🏢 Supplier: {selectedPurchase.supplierName}</p>
            <p>🧾 Invoice: {selectedPurchase.invoiceNumber}</p>
            <p>📅 Date: {selectedPurchase.purchaseDate}</p>
            <p>💰 Total: ₹ {selectedPurchase.totalAmount.toLocaleString("en-IN")}</p>
            <p>🧮 GST: ₹ {selectedPurchase.totalGST.toLocaleString("en-IN")}</p>
            <p>💵 Grand Total: ₹ {selectedPurchase.grandTotal.toLocaleString("en-IN")}</p>
            <p>📦 Items: {selectedPurchase.totalItems}</p>
            <p>💳 Payment: {selectedPurchase.paymentMode}</p>
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-center">Select a purchase to view details.</p>
        )}
      </Sidebar>
    </>
  );
}
