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
import { Button } from "primereact/button";
import { handleEnterKey } from "../../common/common";

interface PurchaseFormProps {
  isEditSidebar: boolean;
  purchase?: PurchaseModel | null;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  isEditSidebar, purchase, onSaveSuccess, onCancel
}) => {

  const [formData, setFormData] = useState<PurchaseModel>({
    purchaseId: 0,
    supplierId: 0,
    supplierName: "",
    purchaseDate: new Date().toISOString(),
    invoiceDate: new Date().toISOString(),
    invoiceAmount: 0,
    invoiceNumber: "",
    totalAmount: 0,
    totalGST: 0,
    grandTotal: 0,
    isActive: true,
    purchaseTypeId: 0,
    cash: 0,
    upi: 0,
    freightAmount: 0,
    roundOff: 0,
    purchaseItems: [],
  });
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<{ label: string; value: number, text: string }[]>([]);
  const [saveTrigger, setSaveTrigger] = useState(0);
  const { showSuccess, showError } = useToast();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [savedAdjustments, setSavedAdjustments] = useState<Record<number, number | undefined>>({});
  const [showCash, setShowCash] = useState(false);
  const [showUpi, setShowUpi] = useState(false);

  const loadAllData = async () => {
    try {
      const suppliersRes = await apiService.get("/Supplier/getallsupplier");
      setSuppliers(suppliersRes.suppliers ?? []);

      const productsRes = await apiService.get("/Product/productdetails?isInventoryRequired=true");
      setProducts(productsRes?.data ?? []);

      const purchaseTypesRes = await apiService.get("/PurchaseType") as PurchaseTypeModel[];
      const purchaseTypeOptions = (purchaseTypesRes ?? []).map(pt => ({
        label: pt.purchaseTypeName,
        value: pt.purchaseTypeId,
        text: pt.purchaseTypeValue
      }));
      setPurchaseTypes(purchaseTypeOptions);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (purchase) {
      setFormData(prev => ({
        ...prev,
        ...purchase,
        purchaseItems: purchase.purchaseItems ?? [],
        invoiceDate: isEditSidebar ? parseDate(purchase.invoiceDate) : parseDate(new Date()),
        purchaseDate: isEditSidebar ? parseDate(purchase.purchaseDate) : parseDate(new Date()),
      }));
      setSavedAdjustments(prev => ({
        ...prev,
        1: purchase.freightAmount,
        2: purchase.roundOff
      }));
    }
  }, [purchase]);

  const parseDate = (value: string | Date | null): Date | null => {
    if (!value) return null;

    // If already a Date → return as-is
    if (value instanceof Date) return value;

    // Otherwise parse string "dd-MM-yyyy"
    const parts = value.split("-");
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);
    return new Date(year, month, day);
  };

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
      , placeholder: "Rate", body: (row: any) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
    },
    {
      field: "quantity", header: "Qty", editable: true, type: "decimal", required: true, placeholder: "Quantity", body: (row: any) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.quantity), width: "110px"
    },
    { field: "gstPercent", header: "GST %", editable: true, type: "decimal", required: true, placeholder: "Gst" },
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

  const handleChange = (field: keyof PurchaseModel, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
  };

  const handleItemsChange = (items: PurchaseItemModel[]) => {
    const updatedFormData = { ...formData, purchaseItems: items };
    updatedFormData.totalAmount = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
    updatedFormData.totalGST = items.reduce((sum, i) => sum + (i.gstAmount ?? 0), 0);
    updatedFormData.grandTotal = items.reduce((sum, i) => sum + (i.totalAmount ?? 0), 0);

    setFormData(updatedFormData);
  };

  const validateChildItems = (items: PurchaseItemModel[]) => {
    const errors: Record<string, Record<string, string>> = {};
    items.forEach(item => {
      const key = item.productId;
      errors[key] = {};
      if (!item.productId) errors[key].productId = "Item Name required";
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors[key].unitPrice = "Rate required";
        showError(`${item.productName}-Rate required`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[key].quantity = "Qty required";
        showError(`${item.productName}-Qty required`)
      }
      if (item.gstPercent == null || item.gstPercent < 0) errors[key].gstPercent = "GST % required";
      if (Object.keys(errors[key]).length === 0) delete errors[key];
    });


    return errors;
  };

  const runLocalValidation = () => {
    const errors: Record<string, string> = {};
    if (!formData.supplierId) errors.supplierId = "Supplier required";
    if (!formData.invoiceNumber?.trim()) errors.invoiceNumber = "Invoice number required";
    if (!formData.invoiceAmount || formData.invoiceAmount <= 0) errors.invoiceAmount = "Invoice amount required";
    if (!formData.invoiceDate) errors.invoiceDate = "Invoice date required";
    if (!formData.purchaseDate) errors.purchaseDate = "Purchase date required";
    if (!formData.purchaseTypeId) errors.purchaseTypeId = "Purchase type required";

    const grandTotal = formData.grandTotal ?? 0;

    const cash = formData.cash ?? 0;
    const upi = formData.upi ?? 0;
    const totalPaid = cash + upi;

    const text: string | undefined = purchaseTypes.find(item => item.value == formData.purchaseTypeId)?.text;

    // Switch based on purchaseTypeId
    switch (text?.toLocaleLowerCase()) {
      case "cash":
        if (cash <= 0) {
          errors.cash = "Cash amount required.";
        }
        if (cash !== grandTotal) {
          errors.cash = "Cash amount must equal grand total.";
        }
        break;
      case "credit":
        if (totalPaid > 0) {
          errors.credit = "No payment allowed for Credit purchase.";
        }
        break;
      case "partial":
        if (cash <= 0 && upi <= 0) {
          if (cash <= 0) errors.cash = "Cash amount required.";
        }
        if (totalPaid !== grandTotal) {
          errors.cash = "Cash/UPI must equal grand total.";
        }
        break;
      case "mixed":
        if (cash <= 0) errors.cash = "Cash amount required.";
        if (upi <= 0) errors.upi = "UPI amount required.";

        if (totalPaid !== grandTotal) {
          errors.cash = "Cash + Upi must equal grand total.";
        }
        if (totalPaid !== grandTotal) {
          errors.upi = "Cash + Upi must equal grand total.";
        }
        break;
      case "upi":
        if (upi <= 0) {
          errors.upi = "UPI amount required.";
        }
        if (upi !== grandTotal) {
          errors.upi = "UPI amount must equal grand total.";
        }
        break;

      default:
        break;
    }

    const itemErrs = validateChildItems(formData.purchaseItems);
    setValidationErrors(errors);

    if (formData.purchaseItems.length === 0) {
      showError("Add atleast one product in the purchase");
    }

    return Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0 && formData.purchaseItems.length > 0;
  };

  const handleSaveForm = async () => {
    if (!runLocalValidation()) {
      return;
    }

    try {
      const payload = { ...formData };
      await apiService.post("/Purchase", payload);
      await loadAllData();
      setValidationErrors({});
      showSuccess("Purchases saved successfully!");
      setFormData(createEmptyPurchase());
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error(err);
      showError("Error saving purchase!");
    }
  };

  const handleUpdateForm = async () => {
    if (!runLocalValidation()) {
      return;
    }

    try {
      const payload = { ...formData };
      await apiService.put(`/Purchase/${payload.purchaseId}`, payload);
      await loadAllData();
      setValidationErrors({});
      showSuccess("Purchases saved successfully!");
      setFormData(createEmptyPurchase());
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error(err);
      showError("Error saving purchase!");
    }
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

  const createEmptyPurchase = (): PurchaseModel => ({
    purchaseId: 0,
    supplierId: 0,
    supplierName: "",
    purchaseDate: new Date().toISOString(),
    invoiceDate: new Date().toISOString(),
    invoiceAmount: 0,
    invoiceNumber: "",
    totalAmount: 0,
    totalGST: 0,
    grandTotal: 0,
    isActive: true,
    purchaseTypeId: 0,
    cash: 0,
    upi: 0,
    freightAmount: 0,
    roundOff: 0,
    purchaseItems: [],
  });

  const onCancelSideBar = () => {
    if (onCancel) onCancel();
  }

  const onChangeCashType = (purchaseTypeId: number) => {
    const selected: string | undefined = purchaseTypes.find(item => item.value == purchaseTypeId)?.text;

    if (!selected) return;

    const type = selected.toLowerCase();

    switch (type) {
      case "cash":
        setShowCash(true);
        setShowUpi(false);
        setFormData(prev => ({ ...prev, upi: 0 }));
        break;

      case "upi":
        setShowCash(false);
        setShowUpi(true);
        setFormData(prev => ({ ...prev, cash: 0 }));
        break;

      case "partially":
        setShowCash(true);
        setShowUpi(true);
        setFormData(prev => ({ ...prev, upi: 0 }));
        break;

      case "mixed":
        setShowCash(true);
        setShowUpi(true);
        break;

      case "credit":
        setShowCash(false);
        setShowUpi(false);
        setFormData(prev => ({ ...prev, cash: 0, upi: 0 }));
        break;

      default:
        setShowCash(false);
        setShowUpi(false);
    }
  };


  // ---------------- RENDER ----------------
  return (
    <div className={`border border-gray-200 rounded-md p-1 ${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
      <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
        <legend className="text-sm font-semibold px-2 text-gray-700">
          {formData.purchaseId ? "Edit Purchase" : "Add Purchase"}
        </legend>

        {!isEditSidebar && (
          <div className="flex gap-2 mb-2">
            <Button label="Save" icon="pi pi-save" onClick={handleSaveForm} className="p-button-sm custom-xs" />
          </div>
        )}

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
            {validationErrors?.supplierId && (
              <span className="mandatory-error text-xs">
                {validationErrors.supplierId}
              </span>
            )}
          </div>

          {/* Invoice Number */}
          <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
            <strong className="text-sm">Invoice Number <span className="mandatory-asterisk">*</span></strong>
            <InputText
              value={formData.invoiceNumber}
              placeholder="Invoice Number"
              onChange={(e) => handleChange("invoiceNumber", e.target.value)}
              className={`w-full mt-1 text-sm ${validationErrors?.invoiceNumber ? "p-invalid" : ""}`}
              style={{ width: "150px" }}
              tabIndex={1}
              onKeyDown={handleEnterKey}
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
              onChange={(e) => handleChange("invoiceAmount", e.value)}
              className={`w-full mt-1 text-sm ${validationErrors?.invoiceAmount ? "p-invalid" : ""}`}
              inputStyle={{ width: "120px" }}
              placeholder="Invoice amount"
              tabIndex={2}
              onKeyDown={handleEnterKey}
            />
            {validationErrors?.invoiceAmount && <span className="mandatory-error text-xs">{validationErrors.invoiceAmount}</span>}
          </div>

          {/* Purchase Type */}
          <div className={isEditSidebar ? "w-[45%]" : "flex-1 min-w-[120px]"}>
            <strong className="text-sm">Purchase Type <span className="mandatory-asterisk">*</span></strong>
            <Dropdown
              value={formData.purchaseTypeId}
              options={purchaseTypes}
              onChange={(e) => {
                handleChange("purchaseTypeId", e.value);
                onChangeCashType(e.value);
              }}
              placeholder="Select Type"
              showClear
              filter
              className={`w-full mt-1 text-sm ${validationErrors?.purchaseTypeId ? "p-invalid" : ""}`}
              tabIndex={3}
              onKeyDown={handleEnterKey}
            />
            {validationErrors?.purchaseTypeId && <span className="mandatory-error text-xs">{validationErrors.purchaseTypeId}</span>}
          </div>

          {showCash && (
            <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
              <strong className="text-sm">Cash</strong>
              <InputNumber
                value={formData.cash}
                mode="currency"
                currency="INR"
                locale="en-IN"
                onChange={(e) => handleChange("cash", e.value)}
                className="w-full mt-1 text-sm"
                inputStyle={{ width: "120px" }}
                placeholder="Cash"
                tabIndex={4}
                onKeyDown={handleEnterKey}
              />
              {validationErrors?.cash && <span className="mandatory-error text-xs">{validationErrors.cash}</span>}
            </div>
          )}

          {showUpi && (
            <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
              <strong className="text-sm">UPI Amount</strong>
              <InputNumber
                value={formData.upi}
                mode="currency"
                currency="INR"
                locale="en-IN"
                onChange={(e) => handleChange("upi", e.value)}
                className="w-full mt-1 text-sm"
                inputStyle={{ width: "120px" }}
                placeholder="Upi"
                tabIndex={5}
                onKeyDown={handleEnterKey}
              />
              {validationErrors?.upi && <span className="mandatory-error text-xs">{validationErrors.upi}</span>}
            </div>
          )}

          {/* Invoice Date */}
          <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
            <strong className="text-sm">Invoice Date <span className="mandatory-asterisk">*</span></strong>
            <Calendar
              value={formData.invoiceDate ? new Date(formData.invoiceDate) : null}
              onChange={(e) => handleChange("invoiceDate", e.value ?? null)}
              placeholder="Select Date"
              dateFormat="dd-mm-yy"
              showIcon
              showButtonBar
              className="w-full h-8 text-sm p-1"
            />
            {validationErrors?.invoiceDate && <span className="mandatory-error text-xs">{validationErrors.invoiceDate}</span>}
          </div>

          {/* Purchase Date */}
          <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
            <strong className="text-sm">Purchase Date <span className="mandatory-asterisk">*</span></strong>
            <Calendar
              value={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
              onChange={(e) => handleChange("purchaseDate", e.value ?? null)}
              placeholder="Select Date"
              dateFormat="dd-mm-yy"
              showIcon
              showButtonBar
              className="w-full h-8 text-sm p-1"
            />
            {validationErrors?.purchaseDate && <span className="mandatory-error text-xs">{validationErrors.purchaseDate}</span>}
          </div>
        </div>

        {/* Purchase Items Table */}
        <div className={`${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
          <TTypedSideBarDatatable<PurchaseItemModel>
            columns={newEntrycolumns}
            data={formData.purchaseItems}
            primaryKey="purchaseItemId"
            products={products}
            suppliers={suppliers}
            isSave={false}
            itemsSaveTrigger={saveTrigger}
            onChange={handleItemsChange}
            isDelete={true}
            isNew={isEditSidebar}
            onAdjustmentsChange={handleAdjustmentsChange}
            savedAdjustments={savedAdjustments}
          />
        </div>

        {isEditSidebar && (
          <div className="flex justify-end gap-2 mt-4">
            {<Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }} outlined onClick={onCancelSideBar} className="p-button-sm custom-xs" />}
            <Button
              type="submit"
              label="Update"
              icon="pi pi-save"
              severity="success"
              className="p-button-sm custom-xs"
              onClick={handleUpdateForm}
            />
          </div>
        )}
      </fieldset>
    </div>
  );
};
