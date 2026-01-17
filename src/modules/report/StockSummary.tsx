import { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { Sidebar } from "primereact/sidebar";
import { Chart } from "primereact/chart";

interface InventoryReportModel {
  productId: number;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  purchasePrice: number;
  lastRestockedDate: string;
  stockValue: number;
  totalPurchased: number;
  totalIssued: number;
}

export default function StockSummary() {
  const [rows, setRows] = useState<InventoryReportModel[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryReportModel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =======================
  // LOAD DATA
  // =======================
  const loadData = async () => {
    const res = await apiService.getQueryParam("/Report/GetInventoryReport");
    if (res && res.status) {
      const data = res?.inventory ?? [];
      setRows(data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =======================
  // TABLE COLUMNS
  // =======================
  const columns: ColumnMeta<InventoryReportModel>[] = [
    { field: "productId", header: "ID", hidden: true },
    { field: "productName", header: "Product", width: "200px", frozen: true },
    { field: "currentStock", header: "Stock", width: "100px" },
    {
      field: "purchasePrice",
      header: "Price",
      width: "120px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.purchasePrice)}
          style={{ backgroundColor: "#3498db", color: "white", fontWeight: 500, textAlign: "center", width: "120px" }}
        />
      ),
    },
    {
      field: "stockValue",
      header: "Stock Value",
      width: "130px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.stockValue)}
          style={{ backgroundColor: "#2ecc71", color: "white", fontWeight: 600, textAlign: "center", width: "130px" }}
        />
      ),
    },
    { field: "totalPurchased", header: "Purchased", width: "120px" },
    { field: "totalIssued", header: "Issued", width: "120px" },
    { field: "lastRestockedDate", header: "Last Restocked", width: "150px" },
  ];

  // =======================
  // HANDLERS
  // =======================
  const handleOpenDetails = (row: InventoryReportModel) => {
    setSelectedProduct(row);
    setIsSidebarOpen(true);
  };

  // =======================
  // CHART DATA
  // =======================
  const chartData = {
    labels: rows.map((r) => r.productName),
    datasets: [
      {
        label: "Current Stock",
        backgroundColor: "#2ecc71",
        data: rows.map((r) => r.currentStock),
      },
      {
        label: "Total Purchased",
        backgroundColor: "#3498db",
        data: rows.map((r) => r.totalPurchased),
      },
      {
        label: "Total Issued",
        backgroundColor: "#e74c3c",
        data: rows.map((r) => r.totalIssued),
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
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Products" } },
      y: { title: { display: true, text: "Quantity" }, beginAtZero: true },
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
            <h4>Total Products</h4>
            <h2>{rows.length}</h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Stock Value</h4>
            <h2>
              ₹{" "}
              {rows.reduce((sum, x) => sum + x.stockValue, 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Purchased Quantity</h4>
            <h2>{rows.reduce((sum, x) => sum + x.totalPurchased, 0)}</h2>
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="p-card p-2 shadow-1 border-round mb-4" style={{ height: "300px" }}>
        <h5>Inventory Summary</h5>
        <Chart type="bar" data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
      </div>

      {/* DATATABLE */}
      <TTypeDatatable<InventoryReportModel>
        data={rows}
        columns={columns}
        primaryKey="productId"
        onEdit={handleOpenDetails}
        isDelete={false}
        isNew={false}
        isEdit={true}
        isSave={false}
        page="inventoryreport"
        showDateFilter={true}
        showDdlFilter={false}
      />

      {/* SIDEBAR */}
      <Sidebar
        visible={isSidebarOpen}
        position="right"
        onHide={() => setIsSidebarOpen(false)}
        header="Product Details"
        style={{ width: "50rem" }}
      >
        {selectedProduct ? (
          <div className="p-3 space-y-2">
            <h3 className="mb-2">{selectedProduct.productName}</h3>
            <p>📦 Current Stock: {selectedProduct.currentStock}</p>
            <p>🟢 Total Purchased: {selectedProduct.totalPurchased}</p>
            <p>🔴 Total Issued: {selectedProduct.totalIssued}</p>
            <p>💰 Stock Value: ₹ {selectedProduct.stockValue.toLocaleString("en-IN")}</p>
            <p>🗓 Last Restocked: {selectedProduct.lastRestockedDate}</p>
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-center">Select a product to view details.</p>
        )}
      </Sidebar>
    </>
  );
}
