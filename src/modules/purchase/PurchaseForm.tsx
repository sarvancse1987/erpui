import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { PurchaseModel } from "../../models/purchase/PurchaseModel";
import { ProductModel } from "../../models/product/ProductModel";
import { OptionModel } from "../../models/product/OptionModel";
import { PurchaseItemModel } from "../../models/purchase/PurchaseItemModel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { SupplierSelector } from "../supplier/SupplierSelector";
import { SupplierModel } from "../../models/supplier/SupplierModel";

interface PurchaseFormProps {
  purchase: PurchaseModel;
  index?: number;
  suppliers: SupplierModel[];
  products: ProductModel[];
  units: OptionModel[];
  validationErrors?: Record<string, string>;
  onSave: (purchase: PurchaseModel) => void;
  onCancel?: () => void;
  isEditSidebar: boolean;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  purchase,
  index = 0,
  suppliers,
  products,
  units,
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar,
}) => {
  const [formData, setFormData] = useState<PurchaseModel>({ ...purchase });

  const handleChange = (field: keyof PurchaseModel, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addNewItem = () => {
    const newItem: PurchaseItemModel = {
      purchaseItemId: 0,
      productId: 0,
      productName: "",
      quantity: 1,
      unitId: 0,
      unitPrice: 0,
      gstRate: 0,
      gstAmount: 0,
      total: 0,
    };
    setFormData((prev) => ({ ...prev, purchaseItems: [newItem, ...prev.purchaseItems] }));
  };

  const handleItemChange = (idx: number, field: keyof PurchaseItemModel, value: any) => {
    const updatedItems = [...formData.purchaseItems];
    const item = { ...updatedItems[idx], [field]: value };

    // Calculate GST & total
    const totalWithoutGST = (item.unitPrice || 0) * (item.quantity || 0);
    item.gstAmount = +(totalWithoutGST * (item.gstRate || 0) / 100).toFixed(2);
    item.total = +(totalWithoutGST + item.gstAmount).toFixed(2);

    updatedItems[idx] = item;
    setFormData((prev) => ({ ...prev, purchaseItems: updatedItems }));

    // Update purchase totals
    const totalAmount = updatedItems.reduce((sum, i) => sum + i.total, 0);
    const gstAmount = updatedItems.reduce((sum, i) => sum + i.gstAmount, 0);
    setFormData((prev) => ({ ...prev, totalAmount, gstAmount, grandTotal: totalAmount + gstAmount }));
  };

  const removeItem = (idx: number) => {
    const updatedItems = formData.purchaseItems.filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, purchaseItems: updatedItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-4">
      {/* Supplier & Dates */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Supplier */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Supplier</label>
          <SupplierSelector
            suppliers={suppliers}
            selectedSupplierId={formData.supplierId}
            onSelect={(supplier) => handleChange("supplierId", supplier.supplierId)}
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
          />
        </div>

        {/* Invoice Number */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Invoice Number</label>
          <InputText
            className="w-full mt-1"
            value={formData.invoiceNumber}
            onChange={(e) => handleChange("invoiceNumber", e.target.value)}
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
          />
        </div>
      </div>


      {/* Purchase Items Grid */}
      <fieldset className="border border-gray-200 rounded-md p-3 mt-4">
        <legend className="text-sm font-semibold">Purchase Items</legend>
        <Button label="Add Item" icon="pi pi-plus" outlined severity="success" className="mb-2" onClick={addNewItem} />

        <DataTable value={formData.purchaseItems} className="p-datatable-gridlines" responsiveLayout="scroll">
          <Column header="S.No" body={(_, i: any) => i + 1} style={{ width: "50px" }} />
          <Column header="Item Name" body={(row, i) => row.productName} editor={(options) => (
            <Dropdown
              value={options.rowData.productId}
              options={products.map(p => ({ label: p.productName, value: p.productId }))}
              onChange={(e) => {
                const selected = products.find(p => p.productId === e.value);
                handleItemChange(options.rowIndex, "productId", selected?.productId || 0);
                handleItemChange(options.rowIndex, "productName", selected?.productName || "");
                handleItemChange(options.rowIndex, "unitPrice", selected?.purchasePrice || 0);
              }}
              placeholder="Select Product"
              filter
              showClear
            />
          )} />
          <Column header="Unit" body={(row) => units.find(u => u.value === row.unitId)?.label || ""} editor={(options) => (
            <Dropdown
              value={options.rowData.unitId}
              options={units}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleItemChange(options.rowIndex, "unitId", e.value)}
              showClear
            />
          )} />
          <Column header="Rate" body={(row) => row.unitPrice} editor={(options) => (
            <InputNumber value={options.rowData.unitPrice} onValueChange={(e) => handleItemChange(options.rowIndex, "unitPrice", e.value)} mode="currency" currency="INR" locale="en-IN" />
          )} />
          <Column header="Qty" body={(row) => row.quantity} editor={(options) => (
            <InputNumber value={options.rowData.quantity} onValueChange={(e) => handleItemChange(options.rowIndex, "quantity", e.value)} min={1} />
          )} />
          <Column header="GST %" body={(row) => row.gstRate} editor={(options) => (
            <InputNumber value={options.rowData.gstRate} onValueChange={(e) => handleItemChange(options.rowIndex, "gstRate", e.value)} suffix="%" />
          )} />
          <Column header="GST Amount" body={(row) => row.gstAmount} />
          <Column header="Total" body={(row) => row.total} />
          <Column header="Actions" body={(_, options) => (
            <Button icon="pi pi-trash" className="p-button-danger p-button-rounded" onClick={() => removeItem(options.rowIndex)} />
          )} style={{ width: "80px" }} />
        </DataTable>
      </fieldset>

      {/* Totals */}
      <div className="flex justify-end gap-4 mt-4">
        <div>Total Amount: ₹{formData.totalAmount.toFixed(2)}</div>
        <div>GST: ₹{formData.gstAmount.toFixed(2)}</div>
        <div>Grand Total: ₹{formData.grandTotal.toFixed(2)}</div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        {onCancel && <Button type="button" label="Cancel" icon="pi pi-times" outlined onClick={onCancel} />}
        <Button type="submit" label={formData.purchaseId ? "Update" : "Save"} icon="pi pi-save" severity="success" />
      </div>
    </form>
  );
};
