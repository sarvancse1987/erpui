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
    customerId: 0,
    saleTypeId:0,
    paymentTypeId:0,
    saleStatusId:0,
    saleDate: new Date(),
    totalAmount: 0,
    totalGST: 0,
    grandTotal: 0,
    paidAmount: 0,
    freightAmount: 0,
    roundOff: 0,
    saleItems: [],
  });

  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();

  // ---------------- LOAD DATA ----------------
  const loadAllData = async () => {
    try {
      const customersRes = await apiService.get("/Customer/getAll");
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
    { field: "gstPercent", header: "GST %", editable: true, type: "decimal" },
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
          <strong>Customer *</strong>
          <CustomerSelector
            customers={customers}
            selectedCustomerId={formData.customerId}
            onSelect={c => handleChange("customerId", c.customerId)}
          />
        </div>

        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
          <strong>Total Amount</strong>
          <InputNumber
            value={formData.totalAmount}
            mode="currency"
            currency="INR"
            locale="en-IN"
            onChange={e => handleChange("totalAmount", e.value)}
          />
        </div>

        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
          <strong>Paid Amount</strong>
          <InputNumber
            value={formData.paidAmount}
            mode="currency"
            currency="INR"
            locale="en-IN"
            onChange={e => handleChange("paidAmount", e.value)}
          />
        </div>

        <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[120px]"}>
          <strong>Sale Date</strong>
          <Calendar
            value={formData.saleDate ? new Date(formData.saleDate) : null}
            onChange={e => handleChange("saleDate", e.value ?? null)}
            dateFormat="dd-mm-yy"
            showIcon
          />
        </div>
      </div>

      <div className={`${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
        <TTypedSideBarDatatable<SaleItemModel>
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

      {isEditSidebar && (
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" label="Cancel" icon="pi pi-times-circle" outlined onClick={onCancelSideBar} />
          <Button type="submit" label="Update" icon="pi pi-save" onClick={handleUpdateForm} />
        </div>
      )}
    </div>
  );
};
