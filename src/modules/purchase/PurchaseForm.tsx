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
  triggerValidation?: any;
  onValidation?: (errors: Record<string, string>) => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  purchase,
  index = 0,
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar,
  triggerValidation,
  onValidation,
}) => {
  const [formData, setFormData] = useState<PurchaseModel>({ ...purchase });
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [units, setUnits] = useState<OptionModel[]>([]);
  const [itemErrors, setItemErrors] = useState<Record<string, Record<string, string>>>({});
  const [saveTrigger, setSaveTrigger] = useState(0);

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

  useEffect(() => {
    if (triggerValidation) runLocalValidation();
  }, [triggerValidation]);

  const columns: ColumnMeta<PurchaseItemModel>[] = [
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

  const handleChange = (field: keyof PurchaseModel, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---------------- ITEM VALIDATION ----------------
  const validateItems = (items: PurchaseItemModel[]) => {
    const errors: Record<string, Record<string, string>> = {};

    items.forEach((item) => {
      const key = item.purchaseItemId;
      errors[key] = {};

      if (!item.productId) errors[key].productId = "Item Name is required";
      if (!item.unitPrice || item.unitPrice <= 0) errors[key].unitPrice = "Rate is required";
      if (!item.quantity || item.quantity <= 0) errors[key].quantity = "Qty is required";
      if (item.gstRate == null || item.gstRate < 0) errors[key].gstRate = "GST % is required";

      if (Object.keys(errors[key]).length === 0) delete errors[key];
    });

    return errors;
  };

  // 🔥 FULL LOCAL VALIDATION (used by parent and save)
  const runLocalValidation = () => {
    const errors: Record<string, string> = {};

    if (!formData.supplierId) errors.supplierId = "Supplier is required";
    if (!formData.invoiceNumber?.trim()) errors.invoiceNumber = "Invoice Number is required";
    if (!formData.invoiceAmount || formData.invoiceAmount <= 0)
      errors.invoiceAmount = "Invoice Amount is required";
    if (!formData.invoiceDate) errors.invoiceDate = "Invoice Date is required";
    if (!formData.purchaseDate) errors.purchaseDate = "Purchase Date is required";

    const itemErrs = validateItems(formData.purchaseItems);
    setItemErrors(itemErrs);

    const hasAnyErrors = Object.keys(errors).length > 0 || Object.keys(itemErrs).length > 0;

    // Send errors to parent
    if (onValidation) {
      onValidation({ ...errors });
    }

    setSaveTrigger(prev => prev + 1);
    return !hasAnyErrors;
  };

  // ---------------- FORM SUBMIT ----------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!runLocalValidation()) {
      showError("Please fix validation errors.");
      return;
    }

    onSave(formData);
  };


  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-2">
      {/* Supplier & Dates */}
      <div className="flex flex-wrap gap-4 mb-2">
        {/* Supplier */}
        <div className="flex-1 min-w-[200px]">
          <strong>
            Supplier <span className="mandatory-asterisk">*</span>
          </strong>
          <SupplierSelector
            suppliers={suppliers}
            selectedSupplierId={formData.supplierId}
            onSelect={(supplier) => handleChange("supplierId", supplier.supplierId)}
          />
          {validationErrors?.supplierId && (
            <span className="mandatory-error">{validationErrors.supplierId}</span>
          )}
        </div>

        {/* Invoice Number */}
        <div className="flex-1 min-w-[200px]">
          <strong>
            Invoice Number <span className="mandatory-asterisk">*</span>
          </strong>
          <InputText
            className="w-full mt-1"
            value={formData.invoiceNumber} placeholder="Invoice Number"
            onChange={(e) => handleChange("invoiceNumber", e.target.value)}
            required
          />
          {validationErrors?.invoiceNumber && (
            <span className="mandatory-error">{validationErrors.invoiceNumber}</span>
          )}
        </div>

        {/* Invoice Number */}
        <div className="flex-1 min-w-[200px]">
          <strong>
            Invoice Amount <span className="mandatory-asterisk">*</span>
          </strong>
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
          {validationErrors?.invoiceAmount && (
            <span className="mandatory-error">{validationErrors.invoiceAmount}</span>
          )}
        </div>

        {/* Invoice Date */}
        <div className="flex-1 min-w-[200px]">
          <strong>
            Invoice Date <span className="mandatory-asterisk">*</span>
          </strong>
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
          {validationErrors?.invoiceDate && (
            <span className="mandatory-error">{validationErrors.invoiceDate}</span>
          )}
        </div>

        {/* Purchase Date */}
        <div className="flex-1 min-w-[200px]">
          <strong>
            Purchase Date <span className="mandatory-asterisk">*</span>
          </strong>
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

          {validationErrors?.purchaseDate && (
            <span className="mandatory-error">{validationErrors.purchaseDate}</span>
          )}
        </div>
      </div>


      {/* Purchase Items Grid */}

      <TTypedSideBarDatatable<PurchaseItemModel>
        columns={columns}
        data={formData.purchaseItems}
        primaryKey="purchaseItemId"
        products={products}
        isSave={false}
        itemsSaveTrigger={saveTrigger}
      />
    </form>
  );
};
