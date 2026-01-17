import { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { Sidebar } from "primereact/sidebar";
import { Chart } from "primereact/chart";

interface GstSalesSummaryModel {
  saleId: number;
  saleRefNo: string;
  customerName: string;
  saleDate: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export default function GstSalesReport() {
  const [rows, setRows] = useState<GstSalesSummaryModel[]>([]);
  const [selectedSale, setSelectedSale] = useState<GstSalesSummaryModel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =======================
  // LOAD DATA
  // =======================
  const loadData = async () => {
    const res = await apiService.getQueryParam("/Report/GetGstSalesSummaryReport");
    if (res && res.status) {
      const data = res?.gstSalesSummary ?? [];
      setRows(data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =======================
  // TABLE COLUMNS
  // =======================
  const columns: ColumnMeta<GstSalesSummaryModel>[] = [
    { field: "saleId", header: "ID", hidden: true },
    { field: "saleRefNo", header: "Invoice", width: "150px", frozen: true },
    { field: "customerName", header: "Customer", width: "200px" },
    { field: "saleDate", header: "Date", width: "130px" },
    {
      field: "taxableAmount",
      header: "Taxable",
      width: "130px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.taxableAmount)}
          style={{ backgroundColor: "#3498db", color: "white", fontWeight: 500, width: "130px", textAlign: "center" }}
        />
      ),
    },
    {
      field: "gstAmount",
      header: "GST",
      width: "120px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.gstAmount)}
          style={{ backgroundColor: "#e67e22", color: "white", fontWeight: 600, width: "120px", textAlign: "center" }}
        />
      ),
    },
    {
      field: "totalAmount",
      header: "Total",
      width: "130px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.totalAmount)}
          style={{ backgroundColor: "#2ecc71", color: "white", fontWeight: 600, width: "130px", textAlign: "center" }}
        />
      ),
    },
    { field: "cgst", header: "CGST", width: "100px" },
    { field: "sgst", header: "SGST", width: "100px" },
    { field: "igst", header: "IGST", width: "100px" }
  ];

  // =======================
  // HANDLERS
  // =======================
  const handleOpenDetails = (row: GstSalesSummaryModel) => {
    setSelectedSale(row);
    setIsSidebarOpen(true);
  };

  // =======================
  // CHART DATA
  // =======================
  const chartData = {
    labels: rows.map((r) => r.saleRefNo),
    datasets: [
      {
        label: "Taxable",
        backgroundColor: "#3498db",
        data: rows.map((r) => r.taxableAmount),
      },
      {
        label: "GST",
        backgroundColor: "#e67e22",
        data: rows.map((r) => r.gstAmount),
      },
      {
        label: "Total",
        backgroundColor: "#2ecc71",
        data: rows.map((r) => r.totalAmount),
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
            return `₹ ${context.raw.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Invoice" } },
      y: { title: { display: true, text: "Amount (INR)" }, beginAtZero: true },
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
            <h4>Total Invoices</h4>
            <h2>{rows.length}</h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total GST Collected</h4>
            <h2 className="text-orange-500">
              ₹ {rows.reduce((sum, x) => sum + x.gstAmount, 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Sales</h4>
            <h2 className="text-green-500">
              ₹ {rows.reduce((sum, x) => sum + x.totalAmount, 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="p-card p-2 shadow-1 border-round mb-4" style={{ height: "300px" }}>
        <h5>GST Sales Summary</h5>
        <Chart type="bar" data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
      </div>

      {/* DATATABLE */}
      <TTypeDatatable<GstSalesSummaryModel>
        data={rows}
        columns={columns}
        primaryKey="saleId"
        onEdit={handleOpenDetails}
        isDelete={false}
        isNew={false}
        isEdit={false}
        isSave={false}
        page="gstsalesreport"
        showDateFilter={true}
        showDdlFilter={false}
      />

      {/* SIDEBAR */}
      <Sidebar
        visible={isSidebarOpen}
        position="right"
        onHide={() => setIsSidebarOpen(false)}
        header="GST Invoice Details"
        style={{ width: "50rem" }}
      >
        {selectedSale ? (
          <div className="p-3 space-y-2">
            <h3 className="mb-2">{selectedSale.saleRefNo}</h3>
            <p>👤 Customer: {selectedSale.customerName}</p>
            <p>📅 Date: {selectedSale.saleDate}</p>
            <p>💼 Taxable: ₹ {selectedSale.taxableAmount.toLocaleString("en-IN")}</p>
            <p>🧾 GST: ₹ {selectedSale.gstAmount.toLocaleString("en-IN")}</p>
            <p>💰 Total: ₹ {selectedSale.totalAmount.toLocaleString("en-IN")}</p>
            <p>📊 CGST: ₹ {selectedSale.cgst}</p>
            <p>📊 SGST: ₹ {selectedSale.sgst}</p>
            <p>📊 IGST: ₹ {selectedSale.igst}</p>
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-center">Select an invoice to view GST details.</p>
        )}
      </Sidebar>
    </>
  );
}
