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
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar,
  triggerValidation,
  onValidation,
}) => {
  const initialData: PurchaseModel = {
    ...purchase,
    ...newPurchase,
    purchaseItems: [
      ...(purchase?.purchaseItems ?? []),
      ...(newPurchase?.purchaseItems ?? []),
    ],
  };

  const [formData, setFormData] = useState<PurchaseModel>(initialData);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<{ label: string; value: number }[]>([]);
  const [itemErrors, setItemErrors] = useState<Record<string, Record<string, string>>>({});
  const [saveTrigger, setSaveTrigger] = useState(0);
  const { showSuccess, showError } = useToast();

  // ---------------- LOAD DATA ----------------
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

      // If creating new, default to Cash
      if (!purchase?.purchaseTypeId) {
        const cashOption = purchaseTypeOptions.find(pt => pt.label.toLowerCase() === "cash");
        if (cashOption) setFormData(prev => ({ ...prev, purchaseTypeId: cashOption.value }));
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

  // When triggerValidation changes
  useEffect(() => {
    if (triggerValidation) runLocalValidation();
  }, [triggerValidation]);

  // When purchase prop changes (edit mode)
  useEffect(() => {
    if (purchase) {
      setFormData(prev => ({
        ...prev,
        ...purchase,
        purchaseItems: purchase.purchaseItems ?? [],
        // invoiceDate: purchase.invoiceDate?parseDate(purchase.invoiceDate),
        // purchaseDate: parseDate(purchase.purchaseDate),
      }));
    }
  }, [purchase]);

  const parseDate = (str: string): Date => {
    const parts = str.split("-");
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1; // JS months are 0-indexed
    const year = Number(parts[2]);
    return new Date(year, month, day);
  };
  // ---------------- TABLE COLUMNS ----------------
  const newEntrycolumns: ColumnMeta<PurchaseItemModel>[] = [
    {
      field: "productId",
      header: "Item Name",
      editable: false,
      type: "textdisabled",
      required: true,
      width: "200px",
      frozen: true,
      body: (row: PurchaseItemModel) => row.productName || "",
      placeholder: "Product Name"
    },
    {
      field: "unitPrice", header: "Rate", editable: true, type: "currency", required: true, width: "110px"
      , placeholder: "Product Rate", body: (row: any) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
    },
    {
      field: "quantity", header: "Qty", editable: true, type: "decimal", required: true, placeholder: "Quantity", body: (row: any) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.quantity), width: "110px"
    },
    { field: "gstPercent", header: "GST %", editable: true, type: "decimal", required: true, placeholder: "Total Gst" },
    {
      field: "amount",
      header: "Amount",
      editable: false,
      body: (row: any) => (
        <div className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
          style={{ background: "#2ecc71", color: "white", borderRadius: "0px", minWidth: "90px", textAlign: "center", height: "100%" }}>
          ₹{(row.amount ?? 0).toFixed(2)}
        </div>
      )
    },
    {
      field: "gstAmount",
      header: "GST Amount",
      editable: false,
      body: (row: any) => (
        <div className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
          style={{ background: "#f1c40f", color: "black", borderRadius: "0px", minWidth: "90px", textAlign: "center", height: "100%" }}>
          ₹{(row.gstAmount ?? 0).toFixed(2)}
        </div>
      )
    },
    {
      field: "totalAmount",
      header: "Grand Total",
      editable: false,
      body: (row: any) => (
        <div className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
          style={{ background: "#3498db", color: "white", borderRadius: "0px", minWidth: "90px", textAlign: "center", height: "100%" }}>
          ₹{(row.totalAmount ?? 0).toFixed(2)}
        </div>
      )
    },
  ];

  // ---------------- FORM CHANGE ----------------
  const handleChange = (field: keyof PurchaseModel, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSave?.(updated);
  };

  const handleItemsChange = (items: PurchaseItemModel[]) => {
    const updatedFormData = { ...formData, purchaseItems: items };
    updatedFormData.totalAmount = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
    updatedFormData.totalGST = items.reduce((sum, i) => sum + (i.gstAmount ?? 0), 0);
    updatedFormData.grandTotal = items.reduce((sum, i) => sum + (i.totalAmount ?? 0), 0);

    setFormData(updatedFormData);
    onSave?.(updatedFormData);
  };

  // ---------------- VALIDATION ----------------
  const validateItems = (items: PurchaseItemModel[]) => {
    const errors: Record<string, Record<string, string>> = {};
    items.forEach(item => {
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

  const runLocalValidation = () => {
    const errors: Record<string, string> = {};
    if (!formData.supplierId) errors.supplierId = "Supplier is required";
    if (!formData.invoiceNumber?.trim()) errors.invoiceNumber = "Invoice Number is required";
    if (!formData.invoiceAmount || formData.invoiceAmount <= 0) errors.invoiceAmount = "Invoice Amount is required";
    if (!formData.invoiceDate) errors.invoiceDate = "Invoice Date is required";
    if (!formData.purchaseDate) errors.purchaseDate = "Purchase Date is required";
    if (!formData.purchaseTypeId) errors.purchaseTypeId = "Purchase Type is required";

    const itemErrs = validateItems(formData.purchaseItems);
    setItemErrors(itemErrs);

    if (onValidation) onValidation({ ...errors });
    setSaveTrigger(prev => prev + 1);

    return Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!runLocalValidation()) return;
    onSave(formData);
  };

  const handleAdjustmentsChange = (adjustments: any) => {
    setFormData(prev => {
      const totalItemsAmount = prev.purchaseItems?.reduce(
        (sum, item) => sum + (item.totalAmount || 0),
        0
      ) || 0;

      const grandTotal =
        totalItemsAmount +
        (adjustments.freightAmount || 0) +
        (adjustments.roundOff || 0);

      return {
        ...prev,
        freightAmount: adjustments.freightAmount,
        roundOff: adjustments.roundOff,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
      };
    });
  };

  // ---------------- RENDER ----------------
  return (
    <form onSubmit={handleSubmit} className={`border border-gray-200 rounded-md p-1 ${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
      <div className={`flex flex-wrap gap-2 mb-2 items-end`}>
        {/* Supplier */}
        <div className={isEditSidebar ? "w-[45%]" : "flex-1 min-w-[140px]"}>
          <strong className="text-sm">Supplier <span className="mandatory-asterisk">*</span></strong>
          <SupplierSelector
            suppliers={suppliers}
            selectedSupplierId={formData.supplierId}
            onSelect={s => handleChange("supplierId", s.supplierId)}
            isValid={!!validationErrors?.supplierId}
          />
          {validationErrors?.supplierId && <span className="mandatory-error text-xs">{validationErrors.supplierId}</span>}
        </div>

        {/* Invoice Number */}
        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
          <strong className="text-sm">Invoice Number <span className="mandatory-asterisk">*</span></strong>
          <InputText
            value={formData.invoiceNumber}
            placeholder="Invoice Number"
            onChange={(e) => handleChange("invoiceNumber", e.target.value)}
            className={`w-full mt-1 text-sm ${validationErrors?.invoiceNumber ? "p-invalid" : ""}`}
          />
          {validationErrors?.invoiceNumber && <span className="mandatory-error text-xs">{validationErrors.invoiceNumber}</span>}
        </div>

        {/* Invoice Amount */}
        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
          <strong className="text-sm">Invoice Amount <span className="mandatory-asterisk">*</span></strong>
          <InputNumber
            value={formData.invoiceAmount}
            mode="currency"
            currency="INR"
            locale="en-IN"
            minFractionDigits={0}
            maxFractionDigits={2}
            onChange={(e) => handleChange("invoiceAmount", e.value)}
            className={`w-full mt-1 text-sm ${validationErrors?.invoiceAmount ? "p-invalid" : ""}`}
          />
          {validationErrors?.invoiceAmount && <span className="mandatory-error text-xs">{validationErrors.invoiceAmount}</span>}
        </div>

        {/* Paid Amount */}
        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
          <strong className="text-sm">Paid Amount</strong>
          <InputNumber
            value={formData.paidAmount}
            mode="currency"
            currency="INR"
            locale="en-IN"
            minFractionDigits={0}
            maxFractionDigits={2}
            onChange={(e) => handleChange("paidAmount", e.value)}
            className="w-full mt-1 text-sm"
          />
        </div>

        {/* Purchase Type */}
        <div className={isEditSidebar ? "w-[45%]" : "flex-1 min-w-[120px]"}>
          <strong className="text-sm">Purchase Type <span className="mandatory-asterisk">*</span></strong>
          <Dropdown
            value={formData.purchaseTypeId}
            options={purchaseTypes}
            onChange={(e) => handleChange("purchaseTypeId", e.value)}
            placeholder="Select Type"
            showClear
            filter
            className={`w-full mt-1 text-sm ${validationErrors?.purchaseTypeId ? "p-invalid" : ""}`}
          />
          {validationErrors?.purchaseTypeId && <span className="mandatory-error text-xs">{validationErrors.purchaseTypeId}</span>}
        </div>

        {/* Invoice Date */}
        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
          <strong className="text-sm">Invoice Date <span className="mandatory-asterisk">*</span></strong>
          <Calendar
            value={formData.invoiceDate ? new Date(formData.invoiceDate) : null}
            onChange={(e) => handleChange("invoiceDate", e.value ? e.value.toISOString() : "")}
            placeholder="Select Date"
            dateFormat="dd-mm-yy"
            showIcon
            showButtonBar
            className="w-full h-8 text-sm p-1"
          />
        </div>

        {/* Purchase Date */}
        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
          <strong className="text-sm">Purchase Date <span className="mandatory-asterisk">*</span></strong>
          <Calendar
            value={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
            onChange={(e) => handleChange("purchaseDate", e.value ? e.value.toISOString() : "")}
            placeholder="Select Date"
            dateFormat="dd-mm-yy"
            showIcon
            showButtonBar
            className="w-full h-8 text-sm p-1"
          />
        </div>
      </div>

      {/* Purchase Items Table */}
      <div className={`${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
        <TTypedSideBarDatatable<PurchaseItemModel>
          columns={newEntrycolumns}
          data={formData.purchaseItems}
          primaryKey="purchaseItemId"
          products={products}
          isSave={false}
          itemsSaveTrigger={saveTrigger}
          onChange={handleItemsChange}
          isDelete={true}
          onAdjustmentsChange={handleAdjustmentsChange}
        />
      </div>
    </form>
  );
};
