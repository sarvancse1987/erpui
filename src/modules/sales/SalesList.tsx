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
import { Button } from "primereact/button";
import { customerNameTemplate } from "../../common/common";
import { PrintTieredMenu } from "./PrintTieredMenu";

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
        shipment: res.shipment.find((i: any) => i.saleId === p.saleId),
      }));
      setSales(mapped ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAllData = async () => {
    try {
      const res = await apiService.get(`/Sale/saledetails`);
      const mapped = res.sale.map((p: any) => ({
        ...p,
        saleItems: res.saleItems.filter((i: any) => i.saleId === p.saleId),
        shipment: res.shipment.find((i: any) => i.saleId === p.saleId),
      }));
    } catch (err) {
      console.error(err);
    } finally {
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
      const ids = rows.map(r => r.customerId);

      await apiService.post("/sale/bulk-delete", ids);

      showSuccess("Sale(s) deleted successfully!");

      // Reload table
      //await loadSuppliers();
    } catch (err) {
      console.error(err);
      showError("Error deleting suppliers");
    }
  };

  const handlePrint = async (data: SaleModel) => {
    try {
      const pdfBlob = await apiService.getPdf(`/Sale/sale-bill/${data.saleId}`);

      if (!pdfBlob || pdfBlob.size === 0) {
        console.error("PDF is empty!");
        return;
      }

      const url = URL.createObjectURL(pdfBlob);
      window.open(url);

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  const columns: ColumnMeta<SaleModel>[] = [
    { field: "customerId", header: "ID", editable: false, hidden: true },
    {
      field: "customerName", header: "Customer Name", width: "160px", frozen: true, body: (row: SaleModel) =>
        customerNameTemplate(row.customerId, row.customerName ?? ""),
    },
    { field: "saleRefNo", header: "Sale Ref No", width: "160px" },
    { field: "saleOnDate", header: "Sale Date", width: "90px" },
    {
      field: "paymentTypeName",
      header: "Sale Type",
      width: "90px",
      body: (row: SaleModel) => {
        let severity: "success" | "warning" | "info" | "danger" = "info";

        const paymentname = row.paymentTypeName?.toLocaleLowerCase();
        switch (paymentname) {
          case "cash":
          case "card":
          case "upi":
          case "mixed":
          case "bank":
          case "cheque":
            severity = "success"; // green
            break;
          case "credit":
            severity = "danger"; // yellow
            break;
          case "partial":
            severity = "warning";
            break;
          default:
            severity = "info"; // blue/neutral
        }

        return (
          <Tag
            value={row.paymentTypeName}
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
      width: "100px",
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
      field: "cash",
      header: "Paid Amt",
      width: "100px",
      body: (row) => {
        const cash = row.cash ?? 0;
        const upi = row.upi ?? 0;

        const totalPaid = cash + upi;
        if (!cash && !upi && row.paymentTypeName?.toLowerCase() !== "credit") return "";

        const paymentType = row.paymentTypeName?.toLowerCase();

        const format = (v: any) =>
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(v);

        // Default severity based on full payment
        let severity: "success" | "danger" | "warning" | "info" =
          totalPaid >= row.totalAmount ? "success" : "danger";

        // override by payment type
        switch (paymentType) {
          case "credit":
            severity = "danger";   // Credit = red
            break;

          case "partial":
          case "partially paid":
            severity = "warning"; // yellow
            break;

          case "cash":
          case "upi":
          case "card":
          case "bank":
          case "cheque":
          case "mixed":
            // keep default severity
            break;

          default:
            severity = "info";
        }

        // Build label list
        const labels: string[] = [];

        switch (paymentType) {
          case "cash":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "upi":
            if (upi) labels.push(`${format(upi)}`);
            break;

          case "card":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "bank":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "cheque":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "credit":
            // ✔ Your requirement applied here
            if (cash) labels.push(`${format(cash)}`);
            else labels.push("Credit");
            break;

          case "mixed":
            if (cash) labels.push(`Cash – ${format(cash)}`);
            if (upi) labels.push(`UPI – ${format(upi)}`);
            break;

          default:
            if (cash) labels.push(`Cash – ${format(cash)}`);
            if (upi) labels.push(`UPI – ${format(upi)}`);
            break;
        }

        return (
          <Tag
            severity={severity}
            className="amount-tag"
            style={{ width: "130px", padding: "4px" }}
          >
            <div className="flex flex-col leading-tight text-xs">
              {labels.map((x, i) => (
                <span key={i}>{x}</span>
              ))}
            </div>
          </Tag>
        );
      },
    },
    {
      field: "balanceAmount",
      header: "Bal Amt",
      width: "100px",
      body: (row: SaleModel) => {
        const cash = row.cash ?? 0;
        const upi = row.upi ?? 0;
        const paid = cash + upi;

        const paymentName = row.paymentTypeName?.toLowerCase();

        let balance =
          paymentName === "credit"
            ? row.grandTotal
            : row.grandTotal - paid;

        const format = (v: number) =>
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(v);

        let severity: "success" | "warning" | "danger";

        if (balance === 0) {
          severity = "success";
        } else if (balance < 0) {
          severity = "danger";
          return (
            <Tag
              value={format(-balance)}
              severity={severity}
              className="amount-tag"
              style={{ width: "90px" }}
            />
          );
        } else {
          severity = paymentName === "credit" ? "danger" : "warning";
        }

        return (
          <Tag
            value={format(balance)}
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
        const balance = row.runningBalance ?? 0;

        let severity: "success" | "warning" | "danger";
        let displayValue: string;

        if (balance === 0) {
          severity = "success";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
        } else if (balance < 0) {
          severity = "warning";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
        } else {
          severity = "danger";
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
        }

        return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
      },
    },
    // {
    //   field: "print",
    //   header: "Print",
    //   width: "27px",
    //   body: (row: SaleModel) => (
    //     <Button
    //       icon="pi pi-print"
    //       className="p-button-sm p-button-text p-button-info"
    //       tooltip="Print Bill"
    //       tooltipOptions={{ position: 'top' }}
    //       style={{ width: "25px", height: "25px", padding: "0" }}
    //       onClick={() => handlePrint(row)}
    //     />
    //   ),
    // },
    {
      field: 'print',
      header: 'Print',
      width: '40px',
      body: (row: SaleModel) => <PrintTieredMenu row={row} />
    }
  ];

  const parentColumns = [
    {
      field: "customerName", header: "Customer Name", width: "130px", body: (row: SaleModel) => (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[150px]">
            {row.customerName || ""}
          </span>

          {row.customerName && (
            <i
              className="pi pi-copy cursor-pointer text-blue-600 hover:text-blue-800"
              title="Copy Product Name"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.customerName ?? "");
              }}
            />
          )}
        </div>
      ),
    },
    { field: "saleRefNo", header: "Sale Ref No", width: "180px" },
    { field: "saleOnDate", header: "Sale Date", width: "130px" },
    {
      field: "paymentTypeName",
      header: "Sale Type",
      width: "90px",
      body: (row: SaleModel) => {
        let severity: "success" | "warning" | "info" | "danger" = "info";

        const paymentname = row.paymentTypeName?.toLocaleLowerCase();
        switch (paymentname) {
          case "cash":
          case "card":
          case "upi":
          case "mixed":
          case "bank":
          case "cheque":
            severity = "success"; // green
            break;
          case "credit":
            severity = "danger"; // yellow
            break;
          case "partial":
            severity = "warning";
            break;
          default:
            severity = "info"; // blue/neutral
        }

        return (
          <Tag
            value={row.paymentTypeName}
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
      field: "cash",
      header: "Paid Amt",
      width: "140px",
      body: (row: SaleModel) => {
        const cash = row.cash ?? 0;
        const upi = row.upi ?? 0;

        const totalPaid = cash + upi;
        if (!cash && !upi && row.paymentTypeName?.toLowerCase() !== "credit") return "";

        const paymentType = row.paymentTypeName?.toLowerCase();

        const format = (v: any) =>
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(v);

        // Default severity based on full payment
        let severity: "success" | "danger" | "warning" | "info" =
          totalPaid >= row.totalAmount ? "success" : "danger";

        // override by payment type
        switch (paymentType) {
          case "credit":
            severity = "danger";   // Credit = red
            break;

          case "partial":
          case "partially paid":
            severity = "warning"; // yellow
            break;

          case "cash":
          case "upi":
          case "card":
          case "bank":
          case "cheque":
          case "mixed":
            // keep default severity
            break;

          default:
            severity = "info";
        }

        // Build label list
        const labels: string[] = [];

        switch (paymentType) {
          case "cash":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "upi":
            if (upi) labels.push(`${format(upi)}`);
            break;

          case "card":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "bank":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "cheque":
            if (cash) labels.push(`${format(cash)}`);
            break;

          case "credit":
            // ✔ Your requirement applied here
            if (cash) labels.push(`${format(cash)}`);
            else labels.push("Credit");
            break;

          case "mixed":
            if (cash) labels.push(`Cash – ${format(cash)}`);
            if (upi) labels.push(`UPI – ${format(upi)}`);
            break;

          default:
            if (cash) labels.push(`Cash – ${format(cash)}`);
            if (upi) labels.push(`UPI – ${format(upi)}`);
            break;
        }

        return (
          <Tag
            severity={severity}
            className="amount-tag"
            style={{ width: "130px", padding: "4px" }}
          >
            <div className="flex flex-col leading-tight text-xs">
              {labels.map((x, i) => (
                <span key={i}>{x}</span>
              ))}
            </div>
          </Tag>
        );
      },
    },
    {
      field: "balanceAmount",
      header: "Bal Amt",
      width: "110px",
      body: (row: SaleModel) => {
        const cash = row.cash ?? 0;
        const upi = row.upi ?? 0;
        const paid = cash + upi;

        const paymentName = row.paymentTypeName?.toLowerCase();

        // --- BALANCE LOGIC ---
        let balance =
          paymentName === "credit"
            ? row.grandTotal // full due
            : row.grandTotal - paid;

        // Format currency
        const format = (v: number) =>
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(v);

        let severity: "success" | "warning" | "danger";

        // --- SEVERITY LOGIC ---
        if (balance === 0) {
          severity = "success"; // settled
        } else if (balance < 0) {
          severity = "danger"; // overpaid
          return (
            <Tag
              value={format(-balance)}
              severity={severity}
              className="amount-tag"
              style={{ width: "90px" }}
            />
          );
        } else {
          severity = paymentName === "credit" ? "danger" : "warning";
          // Credit due -> always red (danger)
          // Partial due -> yellow (warning)
        }

        return (
          <Tag
            value={format(balance)}
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
          severity = "warning";
          displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
        } else {
          severity = "danger";
          displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
        }

        return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
      },
    },
    {
      field: "print",
      header: "Print",
      width: "27px",
      body: (row: SaleModel) => (
        <Button
          icon="pi pi-print"
          className="p-button-sm p-button-text p-button-info"
          tooltip="Print Bill"
          tooltipOptions={{ position: 'top' }}
          style={{ width: "25px", height: "25px", padding: "0" }}
          onClick={() => handlePrint(row)}
        />
      ),
    },
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
            background: "#3498db",
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
              isEdit={true}
              isSave={false}
              page="sale"
              showDateFilter={true}
              showDdlFilter={true}
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
                page="sale"
                showDateFilter={true}
                showDdlFilter={true}
              />
            </div>
          )}
        </TabPanel>

        <TabPanel header={
          <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
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
                updateAllData();
                setIsSidebarOpen(false);
                //setActiveIndex(0);
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
              updateAllData();
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
