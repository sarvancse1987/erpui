import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { SaleModel } from "../../models/sale/SaleModel";
import { CustomerModel } from "../../models/customer/CustomerModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { SaleItemModel } from "../../models/sale/SaleItemModel";
import { CustomerSelector } from "../customer/CustomerSelector";
import { Checkbox } from "primereact/checkbox";
import { CustomerForm } from "../customer/CustomerForm";
import { Sidebar } from "primereact/sidebar";
import { TTypedSaleSideBarDatatable } from "../../components/TTypedSaleSideBarDatatable";
import { Dropdown } from "primereact/dropdown";
import { PaymentTypeModel } from "../../models/sale/PaymentTypeModel";
import { InputText } from "primereact/inputtext";

interface SalesFormProps {
  isEditSidebar: boolean;
  sale?: SaleModel | null;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({
  isEditSidebar, sale, onSaveSuccess, onCancel
}) => {
  const [formData, setFormData] = useState<SaleModel>({
    saleId: 0,
    saleRefNo: "",
    customerId: 0,
    paymentTypeId: 0,
    saleStatusId: 0,
    saleDate: new Date(),
    totalAmount: 0,
    totalGST: 0,
    grandTotal: 0,
    cash: 0,
    upi: 0,
    freightAmount: 0,
    roundOff: 0,
    isGst: false,
    bankName: "",
    chequeNo: "",
    saleItems: [],
    shipment: null
  });

  const [newcustomer, setNewCustomer] = useState<CustomerModel>({
    customerId: 0,
    customerName: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    city: "",
    postalCode: null,
    countryId: 0,
    stateId: 0,
    districtId: 0,
    currentEligibility: null
  });

  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();
  const [showCustomerAdd, setShowCustomerAdd] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [savedAdjustments, setSavedAdjustments] = useState<Record<number, number | undefined>>({});
  const [showCash, setShowCash] = useState(true);
  const [showUpi, setShowUpi] = useState(false);
  const [showCheque, setShowCheque] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [cashType, setCashType] = useState<string>("Cash");
  const [saleId, setSaleId] = useState<number>(0);

  const loadAllData = async () => {
    try {
      const customersRes = await apiService.get("/Customer/details");
      setCustomers(customersRes?.customers ?? []);

      const productsRes = await apiService.get("/Product/productdetails?isInventoryRequired=true");
      setProducts(productsRes?.data ?? []);

      const paymentTypes = await apiService.get("/PaymentType");
      const paymentTypesOptions = (paymentTypes ?? []).map((pt: PaymentTypeModel) => ({
        label: pt.paymentTypeName,
        value: pt.paymentTypeId,
        text: pt.paymentTypeValue
      }));
      setPaymentTypes(paymentTypesOptions ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUpdatedInventory = async () => {
    try {
      const productsRes = await apiService.get("/Product/productdetails?isInventoryRequired=true");
      setProducts(productsRes?.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (sale) {
      setFormData(prev => ({
        ...prev,
        ...sale,
        saleItems: sale.saleItems ?? [],
        saleDate: isEditSidebar ? parseDate(sale.saleDate) : parseDate(new Date()),
      }));

      setSavedAdjustments(prev => ({
        ...prev,
        1: sale.freightAmount,
        2: sale.roundOff,
        3: sale.brokerageAmount
      }));
    }
  }, [sale]);

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

  const renderEditor = (options: any, field: keyof SaleItemModel) => {
    return (
      <InputNumber
        value={options.value[field] ?? 0}
        onValueChange={(e) => {
          const updatedRow = { ...options.value, [field]: e.value ?? 0 };
          updatedRow.amount = (updatedRow.unitPrice ?? 0) * (updatedRow.quantity ?? 0);
          options.editorCallback(updatedRow);
        }}
        mode="decimal"
        minFractionDigits={0}
      />
    );
  };

  const saleColumns: ColumnMeta<SaleItemModel>[] = [
    {
      field: "productId",
      header: "Item Name",
      editable: false,
      type: "textdisabled",
      width: "240px",
      frozen: true,
      body: (row) => row.productName || ""
    },
    {
      field: "salePrice",
      header: "Sale Rate",
      type: "currency",
      width: "140px",
      body: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.salePrice)
    },
    {
      field: "unitPrice",
      header: "Rate",
      editable: true,
      type: "currency",
      required: true,
      width: "240px",
      editor: (options) => renderEditor(options, "unitPrice"),
      body: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
    },
    {
      field: "quantity",
      header: "Qty",
      editable: true,
      type: "decimal",
      required: true,
      width: "240px",
      editor: (options) => renderEditor(options, "quantity"),
      body: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.quantity)
    },
    {
      field: "amount",
      header: "Amount",
      editable: false,
      body: (row) => `₹${(row.amount ?? 0).toFixed(2)}`
    }
  ];

  const handleChange = (field: keyof SaleModel, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemsChange = (items: SaleItemModel[]) => {
    const totalAmount = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
    const grandTotal = totalAmount + (formData.freightAmount || 0) + (formData.roundOff || 0);

    setFormData(prev => ({
      ...prev,
      saleItems: items,
      totalAmount: totalAmount,
      grandTotal: grandTotal
    }));
  };

  const validateChildItems = (items: SaleItemModel[]) => {
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
      if (Object.keys(errors[key]).length === 0) delete errors[key];
    });
    return errors;
  };

  const runLocalValidation = () => {
    const errors: Record<string, string> = {};
    if (!formData.customerId) errors.customerId = "Customer required";
    if (!formData.paymentTypeId) errors.paymentTypeId = "Payment type required";
    if (!formData.saleDate) errors.saleDate = "Sale Date required";


    const grandTotal = formData.grandTotal ?? 0;

    const cash = formData.cash ?? 0;
    const upi = formData.upi ?? 0;
    const totalPaid = cash + upi;

    const text: string | undefined = paymentTypes.find(item => item.value == formData.paymentTypeId)?.text;
    // Switch based on paymentTypeId
    switch (text?.toLocaleLowerCase()) {

      case "cash":
        if (cash <= 0) {
          errors.cash = "Cash required.";
        }
        if (cash !== grandTotal) {
          errors.cash = "Cash must equal grand total.";
        }
        break;
      case "credit":
        if (cash <= 0) {
          errors.cash = "Amount required.";
        }
        if (cash !== grandTotal) {
          errors.cash = "Amount must equal grand total.";
        }
        break;
      case "partial":
        if (cash <= 0 && upi <= 0) {
          if (cash <= 0) errors.cash = "Cash required.";
        }
        if (totalPaid !== grandTotal) {
          errors.cash = "Cash/UPI must equal grand total.";
        }
        break;
      case "mixed":
        if (cash <= 0) errors.cash = "Cash required.";
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
      case "cheque":
        if (cash <= 0) {
          errors.cash = "Amount required.";
        }
        if (cash !== grandTotal) {
          errors.cash = "Amount must equal grand total.";
        }
        if (formData.chequeNo?.length == 0) {
          errors.chequeNo = "Cheque no required.";
        }
        break;
      case "bank":
        if (cash <= 0) {
          errors.cash = "Amount required.";
        }
        if (cash !== grandTotal) {
          errors.cash = "Amount must equal grand total.";
        }
        if (formData.bankName?.length == 0) {
          errors.bankName = "Bank name required.";
        }
        break;

      default:
        break;
    }

    if (!formData.saleDate) errors.saleDate = "Invoice Date is required";

    const itemErrs = validateChildItems(formData.saleItems);
    setValidationErrors(errors);

    if (formData.saleItems.length === 0) {
      showError("Add atleast one product to sale");
    }

    return Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0 && formData.saleItems.length > 0;
  };

  const handleSaveForm = async () => {
    if (!runLocalValidation()) {
      return;
    }

    try {
      const payload = { ...formData };
      if (saleId > 0) {
        await handleUpdateForm();
      }
      else {
        const response = await apiService.post("/Sale", payload);
        if (response) {
          setSaleId(response.saleId);

          const updatedItems = formData.saleItems.map(item => {
            const apiItem = response.items?.find((x: any) => x.productId === item.productId);
            if (apiItem) {
              return {
                ...item,
                saleId: apiItem.saleId,
                saleItemId: apiItem.saleItemId
              };
            }
            return item;
          });

          setFormData(prev => ({
            ...prev,
            saleId: response.saleId,
            saleItems: updatedItems
          }));


          await loadUpdatedInventory();
          setValidationErrors({});
          if (onSaveSuccess) onSaveSuccess();
          showSuccess("Sales saved successfully!");
        }
      }
    } catch (err) {
      console.error(err);
      showError("Error saving sale!");
    }
  };

  const handleUpdateForm = async () => {
    if (!runLocalValidation()) {
      return;
    }

    try {
      await apiService.put(`/Sale/${formData.saleId}`, formData);
      await loadUpdatedInventory();
      setValidationErrors({});
      if (onSaveSuccess) onSaveSuccess();
      showSuccess("Sale updated successfully!");
    } catch (err) {
      console.error(err);
      showError("Error updating sale!");
    }
  };

  const onCancelSideBar = () => {
    if (onCancel) onCancel();
  };

  const handleSaveCustomer = async (updated: CustomerModel) => {
    try {
      if (updated.districtId == 0) {
        updated.districtId = null;
      }

      const response = await apiService.post("/Customer", updated);
      showSuccess("Customers saved successfully!");
      if (response) {
        const customersRes = await apiService.get("/Customer/details");
        setCustomers(customersRes?.customers ?? []);

        if (customersRes) {
          setFormData((prev) => ({
            ...prev,
            customerId: response.customerId,
            customerName: response.customerName
          }));
          setShowCustomerAdd(false);
        }
      }
    } catch (err) {
      console.error(err);
      showError("Error saving customers");
      throw err;
    }
  };

  const handleAdjustmentsChange = (adjustments: any) => {
    setFormData(prev => {
      const totalItemsAmount = prev.saleItems?.reduce(
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

  const onChangeCashType = (purchaseTypeId: number) => {
    const selected: string | undefined = paymentTypes.find(item => item.value == purchaseTypeId)?.text;

    if (!selected) return;

    const type = selected.toLowerCase();

    switch (type) {
      case "cash":
        setShowCash(true);
        setShowUpi(false);
        setShowCheque(false);
        setShowBank(false);
        setFormData(prev => ({ ...prev, upi: 0 }));
        break;

      case "upi":
        setShowCash(false);
        setShowUpi(true);
        setShowCheque(false);
        setShowBank(false);
        setFormData(prev => ({ ...prev, cash: 0 }));
        break;

      case "partially":
        setShowCash(true);
        setShowUpi(true);
        setShowCheque(false);
        setShowBank(false);
        setFormData(prev => ({ ...prev, upi: 0 }));
        break;

      case "mixed":
        setShowCash(true);
        setShowUpi(true);
        setShowCheque(false);
        setShowBank(false);
        break;

      case "credit":
        setShowCash(true);
        setShowUpi(false);
        setShowCheque(false);
        setShowBank(false);
        setCashType("Amount");
        setFormData(prev => ({ ...prev, cash: 0, upi: 0 }));
        break;

      case "cheque":
        setShowCash(true);
        setShowUpi(false);
        setShowCheque(true);
        setShowBank(false);
        setCashType("Amount");
        setFormData(prev => ({ ...prev, cash: 0, upi: 0 }));
        break;

      case "bank":
        setShowCash(true);
        setShowUpi(false);
        setShowBank(true);
        setShowCheque(false);
        setCashType("Amount");
        setFormData(prev => ({ ...prev, cash: 0, upi: 0 }));
        break;

      default:
        setShowCash(false);
        setShowUpi(false);
    }
  };

  const handleShipmentInfo = (shipmentDetails: any) => {
    setFormData(prev => ({
      ...prev,
      shipment: shipmentDetails
    }));
  }

  const handlePrint = async () => {
    try {
      const pdfBlob = await apiService.getPdf(`/Sale/sale-bill/${saleId}`);

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

  return (
    <div className={`border border-gray-200 rounded-md p-1 ${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
      <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
        <legend className="text-sm font-semibold px-2 text-gray-700">
          {formData.saleId ? "Edit Sale" : "Add Sale"}
        </legend>
        {!isEditSidebar && (
          <div className="flex gap-2 mb-2">
            <Button label="Save" icon="pi pi-save" onClick={handleSaveForm} className="p-button-sm custom-xs" />
            {saleId > 0 && (
              <Button label="Print" icon="pi pi-print" onClick={handlePrint} className="p-button-sm p-button-secondary custom-xs" />
            )}
          </div>
        )}



        <div className="flex flex-wrap gap-2 mb-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <strong className="text-sm">Customer <span className="mandatory-asterisk">*</span></strong>
            <CustomerSelector
              customers={customers}
              selectedCustomerId={formData.customerId}
              onSelect={c => handleChange("customerId", c.customerId)}
              isValid={!!validationErrors?.customerId}
            />
            {validationErrors?.customerId && (
              <span className="mandatory-error text-xs">
                {validationErrors.customerId}
              </span>
            )}
          </div>

          <div className="min-w-[50px] mt-4">
            <Button icon="pi pi-plus" onClick={() => setShowCustomerAdd(true)} className="p-button-sm custom-md"
              tooltip="Add New Customer"
              tooltipOptions={{ position: "bottom" }} />
          </div>

          <div className="flex-1 min-w-[200px]">
            <strong className="text-sm">Sale Type <span className="mandatory-asterisk">*</span></strong>
            <Dropdown
              value={formData.paymentTypeId}
              options={paymentTypes}
              onChange={(e) => { handleChange("paymentTypeId", e.value); onChangeCashType(e.value); }}
              placeholder="Select Type"
              showClear
              filter
              className={`w-full mt-1 text-sm ${validationErrors?.paymentTypeId ? "p-invalid" : ""}`}
            />
            {validationErrors?.paymentTypeId && <span className="mandatory-error text-xs">{validationErrors.paymentTypeId}</span>}
          </div>

          {showCash && (
            <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
              <strong className="text-sm">{cashType}</strong>
              <InputNumber
                value={formData.cash}
                mode="currency"
                currency="INR"
                locale="en-IN"
                onChange={(e) => handleChange("cash", e.value)}
                className="w-full mt-1 text-sm"
                inputStyle={{ width: "120px" }}
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
              />
              {validationErrors?.upi && <span className="mandatory-error text-xs">{validationErrors.upi}</span>}
            </div>
          )}

          {showCheque && (
            <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
              <strong className="text-sm">Cheque No</strong>
              <InputText
                value={formData.chequeNo}
                onChange={(e) => handleChange("chequeNo", e.target.value)}
                className="w-full mt-1 text-sm"
              />
              {validationErrors?.chequeNo && <span className="mandatory-error text-xs">{validationErrors.chequeNo}</span>}
            </div>
          )}

          {showBank && (
            <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
              <strong className="text-sm">Bank Name</strong>
              <InputText
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className="w-full mt-1 text-sm"
              />
              {validationErrors?.bankName && <span className="mandatory-error text-xs">{validationErrors.bankName}</span>}
            </div>
          )}

          <div className="flex-1 min-w-[140px]">
            <strong className="text-sm">Sale Date <span className="mandatory-asterisk">*</span></strong>
            <Calendar
              value={formData.saleDate ? new Date(formData.saleDate) : null}
              onChange={e => handleChange("saleDate", e.value ?? null)}
              dateFormat="dd-mm-yy"
              showIcon
              showButtonBar
            />
            {validationErrors?.saleDate && <span className="mandatory-error text-xs">{validationErrors.saleDate}</span>}
          </div>

          <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
            <div className="mb-2">
              <strong className="text-sm">GST Include</strong>
            </div>
            <Checkbox
              checked={formData.isGst}
              onChange={(e) => handleChange("isGst", e.checked)}
            />
          </div>
        </div>

        <div className={`${isEditSidebar ? "max-w-[800px]" : "w-full"} max-h-[300px] overflow-y-auto`}>
          <TTypedSaleSideBarDatatable<SaleItemModel>
            columns={saleColumns}
            data={formData.saleItems}
            primaryKey="saleItemId"
            products={products}
            isSave={false}
            onChange={handleItemsChange}
            isDelete={true}
            isNew={isEditSidebar}
            onAdjustmentsChange={handleAdjustmentsChange}
            savedAdjustments={savedAdjustments}
            onShipment={handleShipmentInfo}
            shipmentInfo={formData?.shipment}
          />
        </div>

        <Sidebar visible={showCustomerAdd}
          position="right"
          onHide={() => setShowCustomerAdd(false)}
          header="Add New Customer"
          style={{ width: '60rem' }}>
          <CustomerForm
            customer={newcustomer}
            onSave={handleSaveCustomer}
            isAddNewCustomer={true}
            isEditSidebar={true}
            onCancel={() => setShowCustomerAdd(false)}
          />
        </Sidebar>

        {isEditSidebar && (
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }} outlined onClick={onCancelSideBar} className="p-button-sm custom-xs" />
            <Button type="submit"
              label="Update"
              icon="pi pi-save"
              severity="success"
              className="p-button-sm custom-xs" onClick={handleUpdateForm} />
          </div>
        )}
      </fieldset>
    </div>
  );
};
