import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { PurchaseModel } from "../../models/purchase/PurchaseModel";
import { OptionModel } from "../../models/product/OptionModel";
import { PurchaseItemModel } from "../../models/purchase/PurchaseItemModel";
import { InputText } from "primereact/inputtext";
import { SupplierSelector } from "../supplier/SupplierSelector";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { TTypedSideBarDatatable } from "../../components/TTypedSideBarDatatable";
import { InputNumber } from "primereact/inputnumber";

interface PurchaseFormProps {
  purchase: PurchaseModel;
  index?: number;
  validationErrors?: Record<string, string>;
  onSave: (purchase: PurchaseModel) => void;
  onCancel?: () => void;
  isEditSidebar: boolean;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  purchase,
  index = 0,
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar,
}) => {
  const [formData, setFormData] = useState<PurchaseModel>({ ...purchase });
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [units, setUnits] = useState<OptionModel[]>([]);
  const [itemErrors, setItemErrors] = useState<Record<string, Record<string, string>>>({});

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {

      const suppliersRes = await apiService.get("/Supplier/getallsupplier");
      setSuppliers(suppliersRes.suppliers ?? []);

      const productsRes = await apiService.get("/Product");
      setProducts(productsRes ?? []);

      const unitsRes = await apiService.get("/Unit");
      setUnits((unitsRes ?? []).map((u: any) => ({ label: u.name, value: u.id })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleChange = (field: keyof PurchaseModel, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const columns: ColumnMeta<PurchaseItemModel>[] = [
    { field: "isNew", header: "New Item", editable: true, type: "checkbox", hidden: true },
    {
      field: "productId",
      header: "Item Name",
      editable: false,
      type: "textdisabled",
      required: true,
      body: (row: PurchaseItemModel) => row.productName || "",
    },
    { field: "unitPrice", header: "Rate", editable: true, type: "currency", required: true },
    { field: "quantity", header: "Qty", editable: true, type: "decimal", required: true },
    { field: "gstRate", header: "GST %", editable: true, type: "gst", required: true },
    {
      field: "total",
      header: "Amount",
      editable: false,
      body: (row: any) => (
        <div
          className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
          style={{
            background: "#2ecc71",
            color: "white",
            borderRadius: "0px",
            minWidth: "90px",   // reduced width
            textAlign: "center",
            height: "100%",     // keeps height consistent
          }}
        >
          ₹{(row.total ?? 0).toFixed(2)}
        </div>
      )
    },

    {
      field: "gstAmount",
      header: "GST Amount",
      editable: false,
      body: (row: any) => (
        <div
          className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
          style={{
            background: "#f1c40f",
            color: "black",
            borderRadius: "0px",
            minWidth: "90px",
            textAlign: "center",
            height: "100%",
          }}
        >
          ₹{(row.gstAmount ?? 0).toFixed(2)}
        </div>
      )
    },

    {
      field: "grandTotal",
      header: "Grand Total",
      editable: false,
      body: (row: any) => (
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
          ₹{(row.grandTotal ?? 0).toFixed(2)}
        </div>
      )
    },

  ];


  const validateItems = (items: PurchaseItemModel[]) => {
    const errors: Record<string, Record<string, string>> = {};

    items.forEach((item) => {
      const key = item.purchaseItemId; // fallback for new rows
      errors[key] = {};

      if (!item.productId) errors[key].productId = "Item Name is required";
      if (!item.unitPrice || item.unitPrice <= 0) errors[key].unitPrice = "Rate is required";
      if (!item.quantity || item.quantity <= 0) errors[key].quantity = "Qty is required";
      if (item.gstRate == null || item.gstRate < 0) errors[key].gstRate = "GST % is required";

      // Remove empty rows
      if (Object.keys(errors[key]).length === 0) delete errors[key];
    });

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ----------------------------
    // 1. Validate Form Required Fields
    // ----------------------------
    const formErrors: Record<string, string> = {};

    if (!formData.supplierId) formErrors.supplierId = "Supplier is required";
    if (!formData.invoiceNumber?.trim()) formErrors.invoiceNumber = "Invoice Number is required";
    if (!formData.invoiceAmount || formData.invoiceAmount <= 0)
      formErrors.invoiceAmount = "Invoice Amount is required";
    if (!formData.invoiceDate) formErrors.invoiceDate = "Invoice Date is required";
    if (!formData.purchaseDate) formErrors.purchaseDate = "Purchase Date is required";

    if (Object.keys(formErrors).length > 0) {
      showError("Please fill all required fields.");
      return;
    }

    // ----------------------------
    // 2. Validate Item Rows
    // ----------------------------
    const itemErrors = validateItems(formData.purchaseItems);

    if (Object.keys(itemErrors).length > 0) {
      setItemErrors(itemErrors);
      showError("Please fill all required item fields.");
      return;
    }

    setItemErrors({});
    onSave(formData);
  };



  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-2">
      {/* Supplier & Dates */}
      <div className="flex flex-wrap gap-4 mb-2">
        {/* Supplier */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Supplier</label>
          <SupplierSelector
            suppliers={suppliers}
            selectedSupplierId={formData.supplierId}
            onSelect={(supplier) => handleChange("supplierId", supplier.supplierId)}
          />
        </div>

        {/* Invoice Number */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Invoice Number</label>
          <InputText
            className="w-full mt-1"
            value={formData.invoiceNumber} placeholder="Invoice Number"
            onChange={(e) => handleChange("invoiceNumber", e.target.value)}
            required
          />
        </div>

        {/* Invoice Number */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Invoice Amount</label>
          <InputNumber
            className="w-full mt-1"
            value={formData.invoiceAmount} placeholder="Invoice Amount"
            mode="currency"
            currency={"INR"}
            locale="en-IN"
            minFractionDigits={0}
            maxFractionDigits={2}
            onChange={(e) => handleChange("invoiceAmount", e.value)}
            required
          />
        </div>

        {/* Invoice Date */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Invoice Date</label>
          <Calendar
            value={formData.invoiceDate ? new Date(formData.invoiceDate) : null}
            onChange={(e) => handleChange("invoiceDate", e.value)}
            className="w-full h-8 text-sm p-1"
            placeholder="Select Date"
            dateFormat="dd-mm-yy"
            showIcon
            inline={false}
            required
          />
        </div>

        {/* Purchase Date */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Purchase Date</label>
          <Calendar
            value={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
            onChange={(e) => handleChange("purchaseDate", e.value)}
            className="w-full h-8 text-sm p-1"
            placeholder="Select Date"
            dateFormat="dd-mm-yy"
            showIcon
            inline={false}
            required
          />
        </div>
      </div>


      {/* Purchase Items Grid */}

      <TTypedSideBarDatatable<PurchaseItemModel>
        columns={columns}
        data={formData.purchaseItems}
        primaryKey="purchaseItemId"
        products={products}
        isSave={false}
      />
    </form>
  );
};
