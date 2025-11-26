import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Sidebar } from "primereact/sidebar";
import { SaleModel } from "../../models/sale/SaleModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { SaleItemModel } from "../../models/sale/SaleItemModel";
import { RadioButton } from "primereact/radiobutton";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ParentChildTable } from "../../components/ParentChildTable";
import { SalesForm } from "./SalesForm";

export default function SaleList() {
  const [sales, setSales] = useState<SaleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSSale] = useState<SaleModel | null>(null);
  const { showSuccess, showError } = useToast();
  const [viewType, setViewType] = useState<"simple" | "detailed">("simple");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/Sale/saledetails`);
      const mapped = res.sale.map((p: any) => ({
        ...p,
        saleItems: res.saleItems.filter((i: any) => i.saleId === p.saleId),
      }));
      setSales(mapped ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleParentEdit = (row: SaleModel) => {
    if (row != null) {
      setSelectedSSale(row);
      setIsSidebarOpen(true);
    }
  };

  const handleOpenEdit = (sale: SaleModel) => {
    setSelectedSSale({ ...sale });
    setIsSidebarOpen(true);
  };

  const handleDeleteSale = async (rows: SaleModel[]) => {
    try {
      // Extract IDs only
      const ids = rows.map(r => r.customerId);

      // Call API (bulk delete)
      await apiService.post("/sale/bulk-delete", ids);

      showSuccess("Sale(s) deleted successfully!");

      // Reload table
      //await loadSuppliers();
    } catch (err) {
      console.error(err);
      showError("Error deleting suppliers");
    }
  };

  const columns: ColumnMeta<SaleModel>[] = [
    { field: "customerId", header: "ID", editable: false, hidden: true },
    { field: "customerName", header: "Customer Name", width: "160px", frozen: true },
    { field: "saleRefNo", header: "Sale Ref No", width: "160px" },
    { field: "saleOnDate", header: "Sale Date", width: "100px" },
    {
      field: "saleTypeName",
      header: "Sale Type",
      width: "90px",
      body: (row: SaleModel) => {
        let severity: "success" | "warning" | "info" | "danger" = "info";

        switch (row.saleTypeName) {
          case "Cash":
            severity = "success"; // green
            break;
          case "Credit":
            severity = "danger"; // yellow
            break;
          case "Partially Paid":
            severity = "warning"; // red
            break;
          default:
            severity = "info"; // blue/neutral
        }

        return (
          <Tag
            value={row.saleTypeName}
            severity={severity}
            className="purchase-type-tag"
            style={{ width: "90px" }}
          />
        );
      },
    },
    {
      field: "grandTotal",
      header: "Total",
      width: "110px",
      body: (row) =>
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
          }).format(row.grandTotal)}
          className="amount-tag"
          style={{
            backgroundColor: "#3498db",
            color: "white",
            fontWeight: "500",
            fontSize: "0.85rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
            display: "inline-block",
            textAlign: "center",
            width: "90px"
          }}
        />
    },
    {
      field: "paidAmount",
      header: "Paid Amt",
      width: "110px",
      body: (row) => {
        if (row.paidAmount == null) return "";
        const isPaidFull = row.paidAmount === row.paidAmount || row.paidAmount > row.totalAmount;
        return (
          <Tag
            value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.paidAmount)}
            severity={isPaidFull ? "info" : "danger"}
            className="amount-tag"
            style={{ width: "90px" }}
          />
        );
      },
    },
    {
      field: "balanceAmount",
      header: "Bal Amt",
      width: "110px",
      body: (row: SaleModel) => {
        const paid = row.paidAmount ?? 0;
        let balance = row.grandTotal - paid;

        let severity: "success" | "warning" | "danger" = "warning";
        let displayValue: any = balance;

        if (balance === 0) {
          severity = "success";
        } else if (balance < 0) {
          severity = "danger";
          displayValue = -balance;
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
          return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
        } else {
          severity = "warning";
        }

        return (
          <Tag
            value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
            severity={severity}
            className="amount-tag"
            style={{ width: "90px" }}
          />
        );
      },
    },
    {
      field: "runningBalance",
      header: "Run Amt",
      width: "100px",
      body: (row: SaleModel) => {
        const balance = row.runningBalance ?? 0; // cumulative/current balance

        let severity: "success" | "warning" | "danger";
        let displayValue: string;

        if (balance === 0) {
          severity = "success"; // fully settled
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
        } else if (balance < 0) {
          // We need to pay buyer → red
          severity = "success";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
        } else {
          // Buyer needs to pay us → green
          severity = "danger";
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
        }

        return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
      },
    }
  ];

  const parentColumns = [
    { field: "customerName", header: "Customer Name", width: "130px" },
    { field: "saleRefNo", header: "Sale Ref No", width: "180px" },
    { field: "saleOnDate", header: "Sale Date", width: "130px" },
    {
      field: "saleType",
      header: "Sale Type",
      width: "110px",
      body: (row: SaleModel) => {
        let severity: "success" | "warning" | "info" | "danger" = "info";

        switch (row.saleTypeName) {
          case "Cash":
            severity = "success"; // green
            break;
          case "Credit":
            severity = "danger"; // yellow
            break;
          case "Partially Paid":
            severity = "warning"; // red
            break;
          default:
            severity = "info"; // blue/neutral
        }

        return (
          <Tag
            value={row.saleTypeName}
            severity={severity}
            className="purchase-type-tag"
            style={{ width: "90px" }}
          />
        );
      },
    },
    {
      field: "grandTotal",
      header: "Total",
      width: "110px",
      body: (row: SaleModel) =>
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
          }).format(row.grandTotal)}
          className="amount-tag"
          style={{
            backgroundColor: "#3498db",
            color: "white",
            fontWeight: "500",
            fontSize: "0.85rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
            display: "inline-block",
            textAlign: "center",
            width: "90px"
          }}
        />
    },
    {
      field: "paidAmount",
      header: "Paid Amt",
      width: "130px",
      body: (row: SaleModel) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
          }).format(row.paidAmount)}
          severity={row.paidAmount === row.grandTotal ? "info" : "danger"}
          className="amount-tag"
          style={{ width: "90px" }}
        />
      )
    },
    {
      field: "balanceAmount",
      header: "Bal Amt",
      width: "120px",
      body: (row: SaleModel) => {
        const paid = row.paidAmount ?? 0;
        let balance = row.grandTotal - paid;

        let severity: "success" | "warning" | "danger" = "warning";
        let displayValue: any = balance;

        if (balance === 0) {
          severity = "success";
        } else if (balance < 0) {
          severity = "danger";
          displayValue = -balance;
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
          return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
        } else {
          severity = "warning";
        }

        return (
          <Tag
            value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
            severity={severity}
            className="amount-tag"
            style={{ width: "90px" }}
          />
        );
      },
    },
    {
      field: "runningBalance",
      header: "Run Amt",
      width: "120px",
      body: (row: SaleModel) => {
        const balance = row.runningBalance ?? 0;

        let severity: "success" | "warning" | "danger";
        let displayValue: string;

        if (balance === 0) {
          severity = "success";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
        } else if (balance < 0) {
          severity = "success";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
        } else {
          severity = "danger";
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
        }

        return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
      },
    }
  ];

  const childColumns: ColumnMeta<SaleItemModel>[] = [
    { field: "productName", header: "Product Name", width: "220px" },
    {
      field: "unitPrice", header: "Rate", width: "170px",
      body: (row: SaleItemModel) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
    },
    {
      field: "quantity",
      header: "Qty",
      width: "170px",
      body: (row: SaleItemModel) => row.quantity.toFixed(2)
    },
    // { field: "gstPercent", header: "GST %", editable: true, type: "decimal", required: true, width: "110px" },
    {
      field: "amount",
      header: "Amount",
      editable: false,
      width: "170px",
      body: (row: SaleItemModel) => (
        <div
          className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
          style={{
            background: "#3b82f6",
            color: "white",
            borderRadius: "0px",
            minWidth: "90px",
            textAlign: "center",
            height: "100%",
          }}
        >
          ₹{(row.amount ?? 0).toFixed(2)}
        </div>
      ),
    },
  ];

  const closeEditSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedSSale(null);
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <p>Loading sales...</p>
      </div>
    );

  return (
    <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
      <h2 className="text-lg font-semibold mb-1">🧾 Sales Management</h2>

      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header={
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <i className="pi pi-wallet" />
            <span>Sales</span>
          </div>
        }>

          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1">
              <RadioButton
                inputId="simpleView"
                name="viewType"
                value="simple"
                onChange={(e) => setViewType(e.value)}
                checked={viewType === "simple"}
              />
              <label htmlFor="simpleView" className="text-sm">Basic View</label>
            </div>
            <div className="flex items-center gap-1">
              <RadioButton
                inputId="detailedView"
                name="viewType"
                value="detailed"
                onChange={(e) => setViewType(e.value)}
                checked={viewType === "detailed"}
              />
              <label htmlFor="detailedView" className="text-sm">Detailed View</label>
            </div>
          </div>

          {setSales.length === 0 ? (
            <p>No sales found.</p>
          ) : viewType === "simple" ? (
            <TTypeDatatable<SaleModel>
              data={sales}
              columns={columns}
              primaryKey="saleId"
              onEdit={handleOpenEdit}
              isDelete={true}
              onDelete={handleDeleteSale}
              isNew={false}
              isSave={false}
            />
          ) : (
            <div className="space-y-2">
              <ParentChildTable<SaleModel, SaleItemModel>
                parentData={sales}
                parentColumns={parentColumns as ColumnMeta<SaleModel>[]}
                childColumns={childColumns as ColumnMeta<SaleItemModel>[]}
                childField={"saleItems" as keyof SaleModel}
                rowKey={"saleId" as keyof SaleModel}
                expandAllInitially={false}
                onEdit={handleParentEdit}
              />
            </div>
          )}
        </TabPanel>

        <TabPanel header={
          <div className="flex items-center gap-2" style={{ color: 'green' }}>
            <i className="pi pi-plus-circle" />
            <span>Add New</span>
          </div>
        }>
          <div className="space-y-4">
            <SalesForm
              key={1}
              isEditSidebar={false}
              sale={selectedSale}
              onSaveSuccess={() => {
                setActiveIndex(0);
                loadAllData();
                setIsSidebarOpen(false);
              }}
              onCancel={closeEditSidebar}
            />
          </div>
        </TabPanel>
      </TabView>

      <Sidebar visible={isSidebarOpen}
        position="right"
        onHide={() => setIsSidebarOpen(false)}
        header="Edit Sale"
        style={{ width: '70rem' }}>
        {selectedSale ? (
          <SalesForm
            key={selectedSale.saleId || "edit"}
            isEditSidebar={true}
            sale={selectedSale}
            onSaveSuccess={() => {
              setActiveIndex(0);
              loadAllData();
              setIsSidebarOpen(false);
            }}
            onCancel={closeEditSidebar}
          />
        ) : <p className="p-4 text-gray-500 text-center">Select a sale to edit.</p>}
      </Sidebar>

      {isSidebarOpen && selectedSale && (
        <Sidebar
          position="right"
          visible={isSidebarOpen}
          onHide={() => setIsSidebarOpen(false)}
          header="Edit Sale"
          style={{ width: '90rem' }}
        >
          <SalesForm
            key={selectedSale.saleId || "edit"}
            isEditSidebar={true}
            sale={selectedSale}
            onSaveSuccess={() => {
              setActiveIndex(0);
              loadAllData();
              setIsSidebarOpen(false);
            }}
            onCancel={closeEditSidebar}
          />
        </Sidebar>
      )}
    </div>
  );
}
