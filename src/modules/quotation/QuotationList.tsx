import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Sidebar } from "primereact/sidebar";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { RadioButton } from "primereact/radiobutton";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ParentChildTable } from "../../components/ParentChildTable";
import { QuotationForm } from "./QuotationForm";
import { Button } from "primereact/button";
import { QuotationModel } from "../../models/quotation/QuotationModel";
import { QuotationItemModel } from "../../models/quotation/QuotationItemModel";
import { customerNameTemplate } from "../../common/common";

export default function QuotationList() {
  const [quotations, setQuotations] = useState<QuotationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QuotationModel | null>(null);
  const { showSuccess, showError } = useToast();
  const [viewType, setViewType] = useState<"simple" | "detailed">("simple");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/Quotation/quotationdetails`);
      const mapped = res.quotation.map((p: any) => ({
        ...p,
        quotationItems: res.quotationItems.filter((i: any) => i.quotationId === p.quotationId),
      }));
      setQuotations(mapped ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAllData = async () => {
    try {
      const res = await apiService.get(`/quotation/quotationdetails`);
      const mapped = res.quotation.map((p: any) => ({
        ...p,
        quotationItems: res.quotationItems.filter((i: any) => i.quotationId === p.quotationId),
        shipment: res.shipment.find((i: any) => i.quotationId === p.quotationId),
      }));
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleParentEdit = (row: QuotationModel) => {
    if (row != null) {
      setSelected(row);
      setIsSidebarOpen(true);
    }
  };

  const handleOpenEdit = (quotation: QuotationModel) => {
    setSelected({ ...quotation });
    setIsSidebarOpen(true);
  };

  const handleDelete = async (rows: QuotationModel[]) => {
    try {
      const ids = rows.map(r => r.customerId);

      await apiService.post("/quotation/bulk-delete", ids);

      showSuccess("Quotation(s) deleted successfully!");

      // Reload table
      //await loadSuppliers();
    } catch (err) {
      console.error(err);
      showError("Error deleting suppliers");
    }
  };

  const handlePrint = async (data: QuotationModel) => {
    try {
      const pdfBlob = await apiService.getPdf(`/quotation/quotation-bill/${data.quotationId}`);

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

  const columns: ColumnMeta<QuotationModel>[] = [
    { field: "customerId", header: "ID", editable: false, hidden: true },
    {
      field: "customerName", header: "Customer Name", width: "160px", frozen: true, body: (row: QuotationModel) =>
        customerNameTemplate(row.customerId ?? 0, row.customerName ?? ""),
    },
    { field: "quotationRefNo", header: "Quotation Ref No", width: "160px" },
    { field: "quotationDate", header: "Quotation Date", width: "90px" },
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
      field: "print",
      header: "Print",
      width: "27px",
      body: (row: QuotationModel) => (
        <Button
          icon="pi pi-print"
          className="p-button-sm p-button-text p-button-info"
          tooltip="Print Bill"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handlePrint(row)}
          style={{ width: "25px", height: "25px", padding: "0" }}
        />
      ),
    },
  ];

  const parentColumns = [
    { field: "customerName", header: "Customer Name", width: "130px" },
    { field: "quotationRefNo", header: "Quotation Ref No", width: "180px" },
    { field: "quotationDate", header: "Quotation Date", width: "130px" },
    {
      field: "grandTotal",
      header: "Total",
      width: "110px",
      body: (row: QuotationModel) =>
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
      field: "print",
      header: "Print",
      width: "27px",
      body: (row: QuotationModel) => (
        <Button
          icon="pi pi-print"
          className="p-button-sm p-button-text p-button-info"
          tooltip="Print Bill"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handlePrint(row)}
          style={{ width: "25px", height: "25px", padding: "0" }}
        />
      ),
    },
  ];

  const childColumns: ColumnMeta<QuotationItemModel>[] = [
    { field: "productName", header: "Product Name", width: "220px" },
    {
      field: "unitPrice", header: "Rate", width: "170px",
      body: (row: QuotationItemModel) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
    },
    {
      field: "quantity",
      header: "Qty",
      width: "170px",
      body: (row: QuotationItemModel) => row.quantity.toFixed(2)
    },
    // { field: "gstPercent", header: "GST %", editable: true, type: "decimal", required: true, width: "110px" },
    {
      field: "amount",
      header: "Amount",
      editable: false,
      width: "170px",
      body: (row: QuotationItemModel) => (
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
    setSelected(null);
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
        <p>Loading quotations...</p>
      </div>
    );

  return (
    <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
      <h2 className="text-lg font-semibold mb-1">🧾 Quotation Management</h2>

      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header={
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <i className="pi pi-file-edit" />
            <span>Quotations</span>
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

          {setQuotations.length === 0 ? (
            <p>No quotaions found.</p>
          ) : viewType === "simple" ? (
            <TTypeDatatable<QuotationModel>
              data={quotations}
              columns={columns}
              primaryKey="quotationId"
              onEdit={handleOpenEdit}
              isDelete={true}
              onDelete={handleDelete}
              isNew={false}
              isEdit={true}
              isSave={false}
              page="quotation"
              showDateFilter={true}
              showDdlFilter={true}
            />
          ) : (
            <div className="space-y-2">
              <ParentChildTable<QuotationModel, QuotationItemModel>
                parentData={quotations}
                parentColumns={parentColumns as ColumnMeta<QuotationModel>[]}
                childColumns={childColumns as ColumnMeta<QuotationItemModel>[]}
                childField={"quotationItems" as keyof QuotationModel}
                rowKey={"quotationId" as keyof QuotationModel}
                expandAllInitially={false}
                onEdit={handleParentEdit}
                page="quotation"
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
            <QuotationForm
              key={1}
              isEditSidebar={false}
              quotation={selected}
              onSaveSuccess={() => {
                updateAllData();
                //setIsSidebarOpen(false);
              }}
              onCancel={closeEditSidebar}
            />
          </div>
        </TabPanel>
      </TabView>

      <Sidebar visible={isSidebarOpen}
        position="right"
        onHide={() => setIsSidebarOpen(false)}
        header="Edit Quotation"
        style={{ width: '70rem' }}>
        {selected ? (
          <QuotationForm
            key={selected.quotationId || "edit"}
            isEditSidebar={true}
            quotation={selected}
            onSaveSuccess={() => {
              setActiveIndex(0);
              updateAllData();
              setIsSidebarOpen(false);
            }}
            onCancel={closeEditSidebar}
          />
        ) : <p className="p-4 text-gray-500 text-center">Select a quotation to edit.</p>}
      </Sidebar>

      {isSidebarOpen && selected && (
        <Sidebar
          position="right"
          visible={isSidebarOpen}
          onHide={() => setIsSidebarOpen(false)}
          header="Edit Quotation"
          style={{ width: '90rem' }}
        >
          <QuotationForm
            key={selected.quotationId || "edit"}
            isEditSidebar={true}
            quotation={selected}
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
