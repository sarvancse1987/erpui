import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { SaleModel } from "../../../models/sale/SaleModel";
import { CustomerModel } from "../../../models/customer/CustomerModel";
import { useToast } from "../../../components/ToastService";
import apiService from "../../../services/apiService";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { SaleItemModel } from "../../../models/sale/SaleItemModel";
import { TTypedSideBarDatatable } from "../../../components/TTypedSideBarDatatable";
import { CustomerSelector } from "../../customer/CustomerSelector";
import { Checkbox } from "primereact/checkbox";
import { CustomerForm } from "../../customer/CustomerForm";
import { Sidebar } from "primereact/sidebar";
import { TTypedSaleSideBarDatatable } from "../../../components/TTypedSaleSideBarDatatable";

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
    salesNumber: "",
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
  const [products, setProducts] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();
  const [showCustomerAdd, setShowCustomerAdd] = useState(false);

  // ---------------- LOAD DATA ----------------
  const loadAllData = async () => {
    try {
      const customersRes = await apiService.get("/Customer/details");
      setCustomers(customersRes?.customers ?? []);

      const productsRes = await apiService.get("/Product/productdetails");
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
        saleDate: sale.saleDate
      }));
    }
  }, [sale]);

  // ---------------- TABLE COLUMNS ----------------
  const saleColumns: ColumnMeta<SaleItemModel>[] = [
    {
      field: "productId",
      header: "Item Name",
      editable: false,
      type: "textdisabled",
      width: "200px",
      frozen: true,
      body: (row) => row.productName || ""
    },
    {
      field: "salePrice",
      header: "Sale Rate",
      type: "currency",
      body: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.salePrice)
    },
    {
      field: "unitPrice",
      header: "Rate",
      editable: true,
      type: "currency",
      body: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
    },
    {
      field: "quantity",
      header: "Qty",
      editable: true,
      type: "decimal",
      body: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.quantity)
    },
    {
      field: "amount",
      header: "Amount",
      editable: false,
      body: (row) =>
        `₹${(row.amount ?? 0).toFixed(2)}`
    },
    {
      field: "gstAmount",
      header: "GST Amount",
      editable: false,
      body: (row) =>
        `₹${(row.gstAmount ?? 0).toFixed(2)}`
    },
    {
      field: "totalAmount",
      header: "Grand Total",
      editable: false,
      body: (row) =>
        `₹${(row.totalAmount ?? 0).toFixed(2)}`
    },
  ];

  // ---------------- FORM CHANGE ----------------
  const handleChange = (field: keyof SaleModel, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemsChange = (items: SaleItemModel[]) => {
    const totalAmount = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
    const totalGST = items.reduce((sum, i) => sum + (i.gstAmount ?? 0), 0);
    const grandTotal = totalAmount + totalGST + (formData.freightAmount || 0) + (formData.roundOff || 0);

    setFormData(prev => ({
      ...prev,
      saleItems: items,
      totalAmount,
      totalGST,
      grandTotal
    }));
  };

  // ---------------- SAVE ----------------
  const handleSaveForm = async () => {
    try {
      await apiService.post("/Sale", formData);
      showSuccess("Sale saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error(err);
      showError("Error saving sale!");
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


  // ---------------- RENDER ----------------
  return (
    <div className={`border border-gray-200 rounded-md p-1 ${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
      {!isEditSidebar && (
        <div className="flex gap-2 mb-2">
          <Button label="Save" icon="pi pi-save" onClick={handleSaveForm} className="p-button-sm custom-xs" />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-2 items-end">
        <div className={isEditSidebar ? "w-[45%]" : "flex-1 min-w-[140px]"}>
          <strong className="text-sm">Supplier <span className="mandatory-asterisk">*</span></strong>
          <CustomerSelector
            customers={customers}
            selectedCustomerId={formData.customerId}
            onSelect={c => handleChange("customerId", c.customerId)}
          />
        </div>

        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[70px]"}>
          <Button label="Add" icon="pi pi-plus" onClick={c => { setShowCustomerAdd(true); }} className="p-button-sm custom-md mt-4" />
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
        </div>

        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
          <strong className="text-sm">Sale Date <span className="mandatory-asterisk">*</span></strong>
          <Calendar
            value={formData.saleDate ? new Date(formData.saleDate) : null}
            onChange={e => handleChange("saleDate", e.value ?? null)}
            dateFormat="dd-mm-yy"
            showIcon
          />
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
