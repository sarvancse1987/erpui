import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { CustomerModel } from "../../models/customer/CustomerModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { CustomerSelector } from "../customer/CustomerSelector";
import { Checkbox } from "primereact/checkbox";
import { CustomerForm } from "../customer/CustomerForm";
import { Sidebar } from "primereact/sidebar";
import { TTypedSaleSideBarDatatable } from "../../components/TTypedSaleSideBarDatatable";
import { QuotationModel } from "../../models/quotation/QuotationModel";
import { QuotationItemModel } from "../../models/quotation/QuotationItemModel";

interface QuotationFormProps {
  isEditSidebar: boolean;
  quotation?: QuotationModel | null;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  isEditSidebar, quotation, onSaveSuccess, onCancel
}) => {
  const [formData, setFormData] = useState<QuotationModel>({
    quotationId: 0,
    quotationRefNo: "",
    customerId: 0,
    quotationDate: new Date(),
    totalAmount: 0,
    totalGST: 0,
    grandTotal: 0,
    freightAmount: 0,
    roundOff: 0,
    isGst: true,
    quotationItems: [],
    status: 0
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
  const [products, setProducts] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();
  const [showCustomerAdd, setShowCustomerAdd] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [savedAdjustments, setSavedAdjustments] = useState<Record<number, number | undefined>>({});
  const [quotationId, setQuotationId] = useState<number>(0);

  const loadAllData = async () => {
    try {
      const customersRes = await apiService.get("/Customer/details");
      setCustomers(customersRes?.customers ?? []);

      const productsRes = await apiService.get("/Product/productdetails?isInventoryRequired=true");
      setProducts(productsRes?.data ?? []);
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
    if (quotation) {
      setFormData(prev => ({
        ...prev,
        ...quotation,
        quotationItems: quotation.quotationItems ?? [],
        //quotationDate: isEditSidebar ? parseDate(quotation.quotationDate) : parseDate(new Date()),
      }));
    }
  }, [quotation]);

  const renderEditor = (options: any, field: keyof QuotationItemModel) => {
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

  const columns: ColumnMeta<QuotationItemModel>[] = [
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

  const handleChange = (field: keyof QuotationModel, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemsChange = (items: QuotationItemModel[]) => {
    const totalAmount = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
    const grandTotal = totalAmount + (formData.freightAmount || 0) + (formData.roundOff || 0);

    setFormData(prev => ({
      ...prev,
      quotationItems: items,
      totalAmount,
      grandTotal
    }));
  };

  const validateChildItems = (items: QuotationItemModel[]) => {
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
    if (!formData.quotationDate) errors.quotationDate = "Quotation Date required";

    const itemErrs = validateChildItems(formData.quotationItems);
    setValidationErrors(errors);

    if (formData.quotationItems.length === 0) {
      showError("Add atleast one product to quotation");
    }

    return Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0 && formData.quotationItems.length > 0;
  };

  const handleSaveForm = async () => {
    if (!runLocalValidation()) {
      return;
    }

    try {
      const payload = { ...formData };
      if (quotationId > 0) {
        await handleUpdateForm();
      }
      else {
        const response = await apiService.post("/quotation", payload);
        if (response) {
          setQuotationId(response.quotationId);

          const updatedItems = formData.quotationItems.map(item => {
            const apiItem = response.items?.find((x: any) => x.productId === item.productId);
            if (apiItem) {
              return {
                ...item,
                quotationId: apiItem.quotationId,
                quotationItemId: apiItem.quotationItemId
              };
            }
            return item;
          });

          setFormData(prev => ({
            ...prev,
            quotationId: response.quotationId,
            quotationItems: updatedItems
          }));


          await loadUpdatedInventory();
          setValidationErrors({});
          if (onSaveSuccess) onSaveSuccess();
          showSuccess("Quotations saved successfully!");
        }
      }
    } catch (err) {
      console.error(err);
      showError("Error saving quotation!");
    }
  };

  const handleUpdateForm = async () => {
    if (!runLocalValidation()) {
      return;
    }

    try {
      await apiService.put(`/quotation/${formData.quotationId}`, formData);
      await loadUpdatedInventory();
      setValidationErrors({});
      if (onSaveSuccess) onSaveSuccess();
      showSuccess("Quotation updated successfully!");
    } catch (err) {
      console.error(err);
      showError("Error updating quotation!");
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
      const totalItemsAmount = prev.quotationItems?.reduce(
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

  const handlePrint = async () => {
    try {
      const pdfBlob = await apiService.getPdf(`/quotation/quotation-bill/${quotationId}`);

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
          {formData.quotationId ? "Edit Quotation" : "Add Quotation"}
        </legend>
        {!isEditSidebar && (
          <div className="flex gap-2 mb-2">
            <Button label="Save" icon="pi pi-save" onClick={handleSaveForm} className="p-button-sm custom-xs" />
            {quotationId > 0 && (
              <Button label="Print" icon="pi pi-print" onClick={handlePrint} className="p-button-sm p-button-secondary custom-xs" />
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <strong className="text-sm">Customer</strong>
            <CustomerSelector
              customers={customers}
              selectedCustomerId={formData.customerId ?? 0}
              onSelect={c => handleChange("customerId", c.customerId)}
              isValid={!!validationErrors?.customerId}
            />
          </div>

          <div className="min-w-[50px] mt-4">
            <Button icon="pi pi-plus" onClick={() => setShowCustomerAdd(true)} className="p-button-info custom-sm"
              tooltip="Add New Customer"
              tooltipOptions={{ position: "bottom" }} />
          </div>

          <div className="flex-1 min-w-[220px]">
            <strong className="text-sm">Quotation Date <span className="mandatory-asterisk">*</span></strong>
            <Calendar
              value={formData.quotationDate ? new Date(formData.quotationDate) : null}
              onChange={e => handleChange("quotationDate", e.value ?? null)}
              dateFormat="dd-mm-yy"
              showIcon
              showButtonBar
              className="flex items-center gap-1 h-[38px]"
            />
            {validationErrors?.quotationDate && <span className="mandatory-error text-xs">{validationErrors.quotationDate}</span>}
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
          <TTypedSaleSideBarDatatable<QuotationItemModel>
            columns={columns}
            data={formData.quotationItems}
            primaryKey="quotationItemId"
            products={products}
            isSave={false}
            onChange={handleItemsChange}
            isDelete={true}
            isNew={isEditSidebar}
            onAdjustmentsChange={handleAdjustmentsChange}
            savedAdjustments={savedAdjustments}
            page="quotation"
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
