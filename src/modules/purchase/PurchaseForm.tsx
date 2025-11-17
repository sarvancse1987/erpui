import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { PurchaseModel } from "../../models/purchase/PurchaseModel";
import { PurchaseItemModel } from "../../models/purchase/PurchaseItemModel";
import { InputText } from "primereact/inputtext";
import { SupplierSelector } from "../supplier/SupplierSelector";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { TTypedSideBarDatatable } from "../../components/TTypedSideBarDatatable";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { PurchaseTypeModel } from "../../models/purchase/purchaseTypemodel";

interface PurchaseFormProps {
  newPurchase: PurchaseModel;
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
  newPurchase,
  index = 0,
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar,
  triggerValidation,
  onValidation,
}) => {

  const initialData = {
    ...purchase,
    ...newPurchase,
    purchaseItems: [
      ...(purchase?.purchaseItems ?? []),
      ...(newPurchase?.purchaseItems ?? []),
    ],
  };

  const [formData, setFormData] = useState<PurchaseModel>(initialData);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<{ label: string; value: number }[]>([]);
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

      const purchaseTypesRes = await apiService.get("/PurchaseType") as PurchaseTypeModel[];
      const purchaseTypeOptions = (purchaseTypesRes ?? []).map(pt => ({
        label: pt.purchaseTypeName,
        value: pt.purchaseTypeId
      }));
      setPurchaseTypes(purchaseTypeOptions);

      const cashOption = purchaseTypeOptions.find(pt => pt.label.toLowerCase() === "cash");
      if (cashOption) {
        setFormData((prev) => ({ ...prev, purchaseTypeId: cashOption.value }));
      }

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
    { field: "gstPercent", header: "GST %", editable: true, type: "decimal", required: true },
    {
      field: "amount",
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
          ₹{(row.amount ?? 0).toFixed(2)}
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
      field: "totalAmount",
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
          ₹{(row.totalAmount ?? 0).toFixed(2)}
        </div>
      )
    },

  ];

  const handleChange = (field: keyof PurchaseModel, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSave?.(updated); // emit combined
  };

  const handleItemsChange = (items: PurchaseItemModel[]) => {
    const updatedFormData = { ...formData, purchaseItems: items };

    // Recalculate totals
    const amount = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
    const gstAmount = items.reduce((sum, i) => sum + (i.gstAmount ?? 0), 0);
    const grandTotal = items.reduce((sum, i) => sum + (i.totalAmount ?? 0), 0);

    updatedFormData.totalAmount = amount;
    updatedFormData.totalGST = gstAmount;
    updatedFormData.grandTotal = grandTotal;

    setFormData(updatedFormData);
    onSave?.(updatedFormData); // emit combined to parent
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
      if (item.gstPercent == null || item.gstPercent < 0) errors[key].gstPercent = "GST % is required";

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
    if (!formData.purchaseTypeId) errors.purchaseTypeId = "Purchase Type is required";

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
      return;
    }

    onSave(formData);
  };


  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-1">
      {/* Supplier & Dates */}
      <div className="flex flex-wrap gap-2 mb-1 items-end">
        {/* Supplier */}
        <div className="flex-1 min-w-[140px]">
          <strong className="text-sm">
            Supplier <span className="mandatory-asterisk">*</span>
          </strong>
          <SupplierSelector
            suppliers={suppliers}
            selectedSupplierId={formData.supplierId}
            onSelect={(supplier) => handleChange("supplierId", supplier.supplierId)}
            isValid={!!validationErrors?.supplierId}
          />
          {validationErrors?.supplierId && (
            <span className="mandatory-error text-xs">{validationErrors.supplierId}</span>
          )}
        </div>

        {/* Invoice Number */}
        <div className="flex-1 min-w-[120px]">
          <strong className="text-sm">
            Invoice Number <span className="mandatory-asterisk">*</span>
          </strong>
          <InputText
            value={formData.invoiceNumber}
            placeholder="Invoice Number"
            onChange={(e) => handleChange("invoiceNumber", e.target.value)}
            className={`w-full mt-1 text-sm ${validationErrors?.invoiceNumber ? "p-invalid" : ""}`}
          />
          {validationErrors?.invoiceNumber && (
            <span className="mandatory-error text-xs">{validationErrors.invoiceNumber}</span>
          )}
        </div>

        {/* Invoice Amount */}
        <div className="flex-1 min-w-[100px]">
          <strong className="text-sm">
            Invoice Amount <span className="mandatory-asterisk">*</span>
          </strong>
          <InputNumber
            className={`w-full mt-1 text-sm ${validationErrors?.invoiceAmount ? "p-invalid" : ""}`}
            value={formData.invoiceAmount}
            placeholder="Invoice Amount"
            mode="currency"
            currency="INR"
            locale="en-IN"
            minFractionDigits={0}
            maxFractionDigits={2}
            onChange={(e) => handleChange("invoiceAmount", e.value)}
          />
          {validationErrors?.invoiceAmount && (
            <span className="mandatory-error text-xs">{validationErrors.invoiceAmount}</span>
          )}
        </div>

        {/* Paid Amount */}
        <div className="flex-1 min-w-[100px]">
          <strong className="text-sm">
            Paid Amount
          </strong>
          <InputNumber
            className="w-full mt-1 text-sm"
            value={formData.paidAmount}
            placeholder="Paid Amount"
            mode="currency"
            currency="INR"
            locale="en-IN"
            minFractionDigits={0}
            maxFractionDigits={2}
            onChange={(e) => handleChange("paidAmount", e.value)}
          />
        </div>

        {/* Purchase Type */}
        <div className="flex-1 min-w-[120px]">
          <strong className="text-sm">
            Purchase Type <span className="mandatory-asterisk">*</span>
          </strong>
          <Dropdown
            className={`w-full mt-1 text-sm ${validationErrors?.purchaseTypeId ? "p-invalid" : ""}`}
            value={formData.purchaseTypeId}
            options={purchaseTypes}
            onChange={(e) => handleChange("purchaseTypeId", e.value)}
            showClear
            filter
            placeholder="Select Type"
          />
          {validationErrors?.purchaseTypeId && (
            <span className="mandatory-error text-xs">{validationErrors.purchaseTypeId}</span>
          )}
        </div>

        {/* Invoice Date */}
        <div className="flex-1 min-w-[120px]">
          <strong className="text-sm">
            Invoice Date <span className="mandatory-asterisk">*</span>
          </strong>
          <Calendar
            value={formData.invoiceDate ? new Date(formData.invoiceDate) : null}
            onChange={(e) => handleChange("invoiceDate", e.value)}
            placeholder="Select Date"
            dateFormat="dd-mm-yy"
            showIcon
            showButtonBar
            className="w-full h-8 text-sm p-1"
          />
        </div>

        {/* Purchase Date */}
        <div className="flex-1 min-w-[120px]">
          <strong className="text-sm">
            Purchase Date <span className="mandatory-asterisk">*</span>
          </strong>
          <Calendar
            value={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
            onChange={(e) => handleChange("purchaseDate", e.value)}
            placeholder="Select Date"
            dateFormat="dd-mm-yy"
            showIcon
            showButtonBar
            className="w-full h-8 text-sm p-1"
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
        itemsSaveTrigger={saveTrigger}
        onChange={handleItemsChange}
      />
    </form>
  );
};
