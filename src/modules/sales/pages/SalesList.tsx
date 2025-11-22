import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Sidebar } from "primereact/sidebar";
import { SaleModel } from "../../../models/sale/SaleModel";
import { useToast } from "../../../components/ToastService";
import apiService from "../../../services/apiService";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { SaleItemModel } from "../../../models/sale/SaleItemModel";
import { RadioButton } from "primereact/radiobutton";
import { TTypeDatatable } from "../../../components/TTypeDatatable";
import { ParentChildTable } from "../../../components/ParentChildTable";
import { SalesForm } from "./SalesForm";

export default function PurchaseList() {
  const [purchases, setPurchases] = useState<SaleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<SaleModel | null>(null);
  const { showSuccess, showError } = useToast();
  const [viewType, setViewType] = useState<"simple" | "detailed">("simple");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/Purchase/purchasedetails`);
      const mapped = res.purchase.map((p: any) => ({
        ...p,
        purchaseItems: res.items.filter((i: any) => i.purchaseId === p.purchaseId),
      }));
      setPurchases(mapped ?? []);
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
      setSelectedPurchase(row);
      setIsSidebarOpen(true);
    }
  };

  const handleOpenEdit = (purchase: SaleModel) => {
    setSelectedPurchase({ ...purchase });
    setIsSidebarOpen(true);
  };

  const handleDeletePurchase = async (rows: SaleModel[]) => {
    try {
      // Extract IDs only
      const ids = rows.map(r => r.customerId);

      // Call API (bulk delete)
      await apiService.post("/purchase/bulk-delete", ids);

      showSuccess("Purchase(s) deleted successfully!");

      // Reload table
      //await loadSuppliers();
    } catch (err) {
      console.error(err);
      showError("Error deleting suppliers");
    }
  };

  const columns: ColumnMeta<SaleModel>[] = [
    { field: "customerId", header: "ID", width: "80px", editable: false, hidden: true },
    { field: "customerName", header: "Customer Name", width: "220px", frozen: true },
    { field: "saleRefNo", header: "Sale Ref No", width: "160px" },
    { field: "saleDate", header: "Sale Date", width: "100px" },
    {
      field: "saleTypeName",
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
          />
        );
      },
    },
    {
      field: "totalAmount",
      header: "Total Amt",
      width: "110px",
      body: (row: SaleModel) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
          }).format(row.totalAmount)}
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
      )
    },
    {
      field: "paidAmount",
      header: "Paid Amt",
      width: "110px",
      body: (row) => {
        if (row.paidAmount == null) return "";
        const isPaidFull = row.paidAmount === row.paidAmount;
        return (
          <Tag
            value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.paidAmount)}
            severity={isPaidFull ? "success" : "danger"}
            className="amount-tag"
            style={{ width: "90px" }}
          />
        );
      },
    },
    {
      field: "balanceAmount",
      header: "Bal Amt",
      width: "120px",
      body: (row: SaleModel) => {
        const paid = row.paidAmount ?? 0;
        let balance = row.totalAmount - paid;

        let severity: "success" | "warning" | "danger" = "warning";
        let displayValue: any = balance;

        if (balance === 0) {
          severity = "success";
        } else if (balance < 0) {
          severity = "danger";
          displayValue = -balance;
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
          return <Tag value={displayValue} severity={severity} className="amount-tag" />;
        } else {
          severity = "warning";
        }

        return (
          <Tag
            value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
            severity={severity}
            className="amount-tag"
          />
        );
      },
    },
    {
      field: "runningBalance",
      header: "Run Amt",
      width: "120px",
      body: (row: SaleModel) => {
        const balance = row.runningBalance ?? 0; // cumulative/current balance

        let severity: "success" | "warning" | "danger";
        let displayValue: string;

        if (balance === 0) {
          severity = "warning"; // fully settled
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

        return <Tag value={displayValue} severity={severity} className="amount-tag" />;
      },
    },
    {
      field: "totalGST",
      header: "Gst Amt",
      width: "110px",
      body: (row) =>
        row.totalGST != null
          ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.totalGST)
          : "",
    },
    {
      field: "grandTotal",
      header: "Grand Total",
      width: "110px",
      body: (row) =>
        row.grandTotal != null
          ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.grandTotal)
          : "",
    }
  ];

  const parentColumns = [
    { field: "customerName", header: "Customer Name", width: "130px" },
    { field: "saleRefNo", header: "Sale Ref No", width: "180px" },
    { field: "saleDate", header: "Sale Date", width: "130px" },
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
          />
        );
      },
    },
    {
      field: "totalAmount",
      header: "Total Amt",
      width: "130px",
      body: (row: SaleModel) => (
        <Tag
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
          }).format(row.totalAmount)}
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
      )
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
          severity={row.paidAmount === row.totalAmount ? "success" : "danger"}
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
        let balance = row.totalAmount - paid;

        let severity: "success" | "warning" | "danger" = "warning";
        let displayValue: any = balance;

        if (balance === 0) {
          severity = "success";
        } else if (balance < 0) {
          severity = "danger";
          displayValue = -balance;
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
          return <Tag value={displayValue} severity={severity} className="amount-tag" />;
        } else {
          severity = "warning";
        }

        return (
          <Tag
            value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
            severity={severity}
            className="amount-tag"
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
          severity = "warning";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
        } else if (balance < 0) {
          severity = "success";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
        } else {
          severity = "danger";
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
        }

        return <Tag value={displayValue} severity={severity} className="amount-tag" />;
      },
    },
    {
      field: "grandTotal",
      header: "Grand Total",
      width: "120px",
      body: (row: SaleModel) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.grandTotal)
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
            background: "#2ecc71",
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
    setSelectedPurchase(null);
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

          {purchases.length === 0 ? (
            <p>No purchases found.</p>
          ) : viewType === "simple" ? (
            <TTypeDatatable<SaleModel>
              data={purchases}
              columns={columns}
              primaryKey="saleId"
              onEdit={handleOpenEdit}
              isDelete={true}
              onDelete={handleDeletePurchase}
              isNew={false}
              isSave={false}
            />
          ) : (
            <div className="space-y-2">
              <ParentChildTable<SaleModel, SaleItemModel>
                parentData={purchases}
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
              sale={selectedPurchase}
              onSaveSuccess={() => {
                setActiveIndex(0);
                loadAllData();
              }}
              onCancel={closeEditSidebar}
            />
          </div>
        </TabPanel>
      </TabView>

      <Sidebar visible={isSidebarOpen}
        position="right"
        onHide={() => setIsSidebarOpen(false)}
        header="Edit Purchase"
        style={{ width: '70rem' }}>
        {selectedPurchase ? (
          <SalesForm
            key={selectedPurchase.saleId || "edit"}
            isEditSidebar={true}
            sale={selectedPurchase}
            onSaveSuccess={() => {
              setActiveIndex(0);
              loadAllData();
            }}
            onCancel={closeEditSidebar}
          />
        ) : <p className="p-4 text-gray-500 text-center">Select a purchase to edit.</p>}
      </Sidebar>

      {isSidebarOpen && selectedPurchase && (
        <Sidebar
          position="right"
          visible={isSidebarOpen}
          onHide={() => setIsSidebarOpen(false)}
          header="Edit Purchase"
          style={{ width: '90rem' }}
        >
          <SalesForm
            key={selectedPurchase.saleId || "edit"}
            isEditSidebar={true}
            sale={selectedPurchase}
            onSaveSuccess={() => {
              setActiveIndex(0);
              loadAllData();
            }}
            onCancel={closeEditSidebar}
          />
        </Sidebar>
      )}
    </div>
  );
}
