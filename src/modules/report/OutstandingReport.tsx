import { TabPanel, TabView } from "primereact/tabview";
import { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { Sidebar } from "primereact/sidebar";
import { Chart } from "primereact/chart";

interface CustomerOutstandingModel {
  customerId: number;
  customerName: string;
  phone: string;
  totalBills: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  lastDueDate: string;
}

export default function OutstandingReport() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rows, setRows] = useState<CustomerOutstandingModel[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOutstandingModel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =======================
  // DATE HELPERS
  // =======================
  const formatLocalDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  const formatDateOnly = (date: Date) =>
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const getLast30DaysRange = () => {
    const toDate = new Date();
    const fromDate = new Date(toDate);
    fromDate.setDate(toDate.getDate() - 30);
    fromDate.setHours(0, 0, 0, 0);

    return {
      fromDate: formatDateOnly(fromDate),
      toDate: formatLocalDateTime(toDate),
    };
  };

  // =======================
  // LOAD DATA
  // =======================
  const loadData = async () => {
    const res = await apiService.getQueryParam("/Report/GetCustomerOutstanding");
    if (res && res.status) {
      const data = res?.customerOutstanding ?? [];
      setRows(data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =======================
  // TABLE COLUMNS
  // =======================
  const columns: ColumnMeta<CustomerOutstandingModel>[] = [
    { field: "customerId", header: "ID", hidden: true },
    { field: "customerName", header: "Customer", width: "180px", frozen: true },
    { field: "phone", header: "Phone", width: "120px" },
    { field: "totalBills", header: "Bills", width: "80px" },
    {
      field: "totalBilled",
      header: "Billed",
      width: "110px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.totalBilled)}
          className="amount-tag"
          style={{
            backgroundColor: "#2ecc71",
            color: "white",
            fontWeight: "500",
            fontSize: "0.85rem",
            width: "110px",
            textAlign: "center",
          }}
        />
      ),
    },
    {
      field: "totalPaid",
      header: "Paid",
      width: "110px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.totalPaid)}
          className="amount-tag"
          style={{
            backgroundColor: "#3498db",
            color: "white",
            fontWeight: "500",
            fontSize: "0.85rem",
            width: "110px",
            textAlign: "center",
          }}
        />
      ),
    },
    {
      field: "totalOutstanding",
      header: "Outstanding",
      width: "130px",
      body: (row) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.totalOutstanding)}
          severity="danger"
          style={{
            width: "130px",
            textAlign: "center",
            fontWeight: "600",
          }}
        />
      ),
    },
    { field: "lastDueDate", header: "Last Due", width: "110px" },
  ];

  // =======================
  // HANDLERS
  // =======================
  const handleOpenDetails = (row: CustomerOutstandingModel) => {
    setSelectedCustomer(row);
    setIsSidebarOpen(true);
  };

  // =======================
  // CHART DATA
  // =======================
  const chartData = {
    labels: rows.map((r) => r.customerName),
    datasets: [
      {
        label: "Billed",
        backgroundColor: "#2ecc71",
        data: rows.map((r) => r.totalBilled),
      },
      {
        label: "Paid",
        backgroundColor: "#3498db",
        data: rows.map((r) => r.totalPaid),
      },
      {
        label: "Outstanding",
        backgroundColor: "#e74c3c",
        data: rows.map((r) => r.totalOutstanding),
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
      x: { title: { display: true, text: "Customer" } },
      y: { title: { display: true, text: "Amount (INR)" }, beginAtZero: true },
    },
  };

  // =======================
  // UI
  // =======================
  return (
    <>
      {/* SUMMARY CARDS */}
      <div className="grid p-1">
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Customers</h4>
            <h2>{rows.length}</h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Billed</h4>
            <h2>
              ₹ {rows.reduce((sum, x) => sum + x.totalBilled, 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="p-card p-1 shadow-2 border-round">
            <h4>Total Outstanding</h4>
            <h2 className="text-red-500">
              ₹ {rows.reduce((sum, x) => sum + x.totalOutstanding, 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="p-card p-2 shadow-1 border-round mb-4" style={{ height: "300px" }}>
  <h5>Customer Outstanding Summary</h5>
  <Chart 
    type="bar" 
    data={chartData} 
    options={{
      ...chartOptions,
      maintainAspectRatio: false // important for compact height
    }} 
  />
</div>

      {/* DATATABLE */}
      <TTypeDatatable<CustomerOutstandingModel>
        data={rows}
        columns={columns}
        primaryKey="customerId"
        onEdit={handleOpenDetails}
        isDelete={false}
        isNew={false}
        isEdit={true}
        isSave={false}
        page="customeroutstanding"
        showDateFilter={true}
        showDdlFilter={false}
      />

      {/* SIDEBAR */}
      <Sidebar
        visible={isSidebarOpen}
        position="right"
        onHide={() => setIsSidebarOpen(false)}
        header="Customer Invoice Details"
        style={{ width: "70rem" }}
      >
        {selectedCustomer ? (
          <div className="p-3 space-y-2">
            <h3 className="mb-2">{selectedCustomer.customerName}</h3>
            <p>📞 {selectedCustomer.phone}</p>
            <p>
              🧾 Total Outstanding:{" "}
              <strong className="text-red-500">
                ₹ {selectedCustomer.totalOutstanding.toLocaleString("en-IN")}
              </strong>
            </p>

            <div className="mt-3 text-gray-500">
              🔜 Invoice-level drill-down can load here
            </div>
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-center">Select a customer to view details.</p>
        )}
      </Sidebar>
    </>
  );
}
