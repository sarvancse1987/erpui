import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { SaleModel } from "../../../models/sale/SaleModel";
import { CustomerModel } from "../../../models/customer/CustomerModel";
import { useToast } from "../../../components/ToastService";
import apiService from "../../../services/apiService";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { SaleItemModel } from "../../../models/sale/SaleItemModel";
import { CustomerSelector } from "../../customer/CustomerSelector";
import { Checkbox } from "primereact/checkbox";
import { CustomerForm } from "../../customer/CustomerForm";
import { Sidebar } from "primereact/sidebar";
import { TTypedSaleSideBarDatatable } from "../../../components/TTypedSaleSideBarDatatable";
import { Dropdown } from "primereact/dropdown";
import { SaleTypeModel } from "../../../models/sale/SaleTypeModel";

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
    saleTypeId: 0,
    paymentTypeId: 0,
    saleStatusId: 0,
    saleDate: new Date(),
    totalAmount: 0,
    totalGST: 0,
    grandTotal: 0,
    paidAmount: 0,
    freightAmount: 0,
    roundOff: 0,
    isGst: false,
    saleItems: [],
  });

  const [newcustomer, setNewCustomer] = useState<CustomerModel>({
    customerId: 0,
    customerName: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    city: "",
    postalCode: "",
    countryId: 0,
    stateId: 0,
    districtId: 0,
    currentEligibility: null
  });

  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [saleTypes, setSaleTypes] = useState<SaleTypeModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();
  const [showCustomerAdd, setShowCustomerAdd] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadAllData = async () => {
    try {
      const customersRes = await apiService.get("/Customer/details");
      setCustomers(customersRes?.customers ?? []);

      const productsRes = await apiService.get("/Product/productdetails?isInventoryRequired=true");
      setProducts(productsRes?.data ?? []);

      const saleTypes = await apiService.get("/SaleType");
      const saleTypeOptions = (saleTypes ?? []).map((pt: SaleTypeModel) => ({
        label: pt.saleTypeName,
        value: pt.saleTypeId
      }));
      setSaleTypes(saleTypeOptions ?? []);
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
        saleDate: sale.saleDate
      }));
    }
  }, [sale]);

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
      totalAmount,
      grandTotal
    }));
  };

  const validateChildItems = (items: SaleItemModel[]) => {
    const errors: Record<string, Record<string, string>> = {};
    items.forEach(item => {
      const key = item.saleItemId;
      errors[key] = {};
      if (!item.productId) errors[key].productId = "Item Name is required";
      if (!item.unitPrice || item.unitPrice <= 0) errors[key].unitPrice = "Rate is required";
      if (!item.quantity || item.quantity <= 0) errors[key].quantity = "Qty is required";
      if (Object.keys(errors[key]).length === 0) delete errors[key];
    });
    return errors;
  };

  const runLocalValidation = () => {
    const errors: Record<string, string> = {};
    if (!formData.customerId) errors.customerId = "Customer is required";
    if (!formData.saleTypeId) errors.saleTypeId = "Sale type is required";
    const paidAmountRequired =
      formData.saleTypeId === 1 || formData.saleTypeId === 3;

    if (paidAmountRequired) {
      if (!formData.paidAmount || formData.paidAmount <= 0) {
        errors.paidAmount = "Paid Amount is required";
      } else {
        if (formData.saleTypeId === 1 && formData.paidAmount !== formData.grandTotal) {
          errors.paidAmount = `For Cash sales, Paid Amount must match the Grand Total (${formData.grandTotal.toFixed(2)}).`;
        }
      }
    }
    if (!formData.saleDate) errors.saleDate = "Invoice Date is required";

    const itemErrs = validateChildItems(formData.saleItems);
    setValidationErrors(errors);

    return Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0 && formData.saleItems.length > 0;
  };

  const handleSaveForm = async () => {
    if (!runLocalValidation()) {
      return;
    }

    try {
      const payload = { ...formData };
      await apiService.post("/Sale", payload);
      await loadAllData();
      setValidationErrors({});
      showSuccess("Sales saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error(err);
      showError("Error saving purchase!");
    }
  };

  const handleUpdateForm = async () => {
    try {
      await apiService.put(`/Sale/${formData.saleId}`, formData);
      showSuccess("Sale updated successfully!");
      if (onSaveSuccess) onSaveSuccess();
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

  return (
    <div className={`border border-gray-200 rounded-md p-1 ${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
      {!isEditSidebar && (
        <div className="flex gap-2 mb-2">
          <Button label="Save" icon="pi pi-save" onClick={handleSaveForm} className="p-button-sm custom-xs" />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-2 items-end">
        <div className={isEditSidebar ? "w-[45%]" : "flex-1 min-w-[140px]"}>
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

        <div className={isEditSidebar ? "w-[25%]" : "w-[25%]"}>
          <Button label="Add" icon="pi pi-plus" onClick={c => { setShowCustomerAdd(true); }} className="p-button-sm custom-md mt-4" />
        </div>

        <div className={isEditSidebar ? "w-[45%]" : "flex-1 min-w-[120px]"}>
          <strong className="text-sm">Sale Type <span className="mandatory-asterisk">*</span></strong>
          <Dropdown
            value={formData.saleTypeId}
            options={saleTypes}
            onChange={(e) => handleChange("saleTypeId", e.value)}
            placeholder="Select Type"
            showClear
            filter
            className={`w-full mt-1 text-sm ${validationErrors?.saleTypeId ? "p-invalid" : ""}`}
          />
          {validationErrors?.saleTypeId && <span className="mandatory-error text-xs">{validationErrors.saleTypeId}</span>}
        </div>

        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[140px]"}>
          <strong className="text-sm">Paid Amount <span className="mandatory-asterisk">*</span></strong>
          <InputNumber
            value={formData.paidAmount}
            mode="currency"
            currency="INR"
            locale="en-IN"
            onChange={e => handleChange("paidAmount", e.value)}
          />
          {validationErrors?.paidAmount && <span className="mandatory-error text-xs">{validationErrors.paidAmount}</span>}
        </div>

        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
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

        <div className="flex items-center gap-2 mt-5">
          <strong className="mb-2">GST Include</strong>
          <Checkbox
            checked={formData.isGst}
            onChange={(e) => handleChange("isGst", e.checked)}
          />
        </div>
      </div>

      <div className={`${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
        <TTypedSaleSideBarDatatable<SaleItemModel>
          columns={saleColumns}
          data={formData.saleItems}
          primaryKey="saleItemId"
          products={products}
          isSave={false}
          onChange={handleItemsChange}
          isDelete={true}
          isNew={isEditSidebar}
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
          onCancel={() => setShowCustomerAdd(false)}
        />
      </Sidebar>

      {isEditSidebar && (
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" label="Cancel" icon="pi pi-times-circle" outlined onClick={onCancelSideBar} />
          <Button type="submit" label="Update" icon="pi pi-save" onClick={handleUpdateForm} />
        </div>
      )}
    </div>
  );
};
