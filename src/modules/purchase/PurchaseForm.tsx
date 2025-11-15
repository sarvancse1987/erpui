import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { PurchaseModel } from "../../models/purchase/PurchaseModel";
import { ProductModel } from "../../models/product/ProductModel";
import { OptionModel } from "../../models/product/OptionModel";
import { PurchaseItemModel } from "../../models/purchase/PurchaseItemModel";
import { InputText } from "primereact/inputtext";
import { SupplierSelector } from "../supplier/SupplierSelector";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../components/TTypedDatatable";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";

interface PurchaseFormProps {
  purchase: PurchaseModel;
  index?: number;
  validationErrors?: Record<string, string>;
  onSave: (purchase: PurchaseModel) => void;
  onCancel?: () => void;
  isEditSidebar: boolean;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  purchase,
  index = 0,
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar,
}) => {
  const [formData, setFormData] = useState<PurchaseModel>({ ...purchase });
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [units, setUnits] = useState<OptionModel[]>([]);

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

  const columns: ColumnMeta<PurchaseItemModel>[] = [
    { field: "productId", header: "Item Name", editable: true, type: "productSearch", required: true },
    { field: "unitId", header: "Unit", editable: true, type: "select", options: units, required: true },
    { field: "unitPrice", header: "Rate", editable: true, type: "number", required: true },
    { field: "quantity", header: "Qty", editable: true, type: "number", required: true },
    { field: "gstRate", header: "GST %", editable: true, type: "gst", required: true },
    { field: "gstAmount", header: "GST Amount", editable: false, type: "number" },
    { field: "total", header: "Total", editable: false, type: "number" },
  ];

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
        {/* <Button label="Add Item" icon="pi pi-plus" outlined severity="success" className="mb-2" onClick={addNewItem} /> */}

        <TTypedDatatable<PurchaseItemModel>
          columns={columns}
          data={formData.purchaseItems}
          primaryKey="purchaseItemId"
          products={products}
        // onSave={onActiveSave}
        // onDelete={onActiveDelete}
        />

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
