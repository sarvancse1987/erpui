import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { PurchaseModel } from "../../models/purchase/PurchaseModel";
import { OptionModel } from "../../models/product/OptionModel";
import { PurchaseItemModel } from "../../models/purchase/PurchaseItemModel";
import { InputText } from "primereact/inputtext";
import { SupplierSelector } from "../supplier/SupplierSelector";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { TTypedSideBarDatatable } from "../../components/TTypedSideBarDatatable";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const columns: ColumnMeta<PurchaseItemModel>[] = [
    { field: "isNew", header: "New Item", editable: true, type: "checkbox", hidden: true },
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
    { field: "gstRate", header: "GST %", editable: true, type: "gst", required: true },
    { field: "total", header: "Amount", editable: false, body: (row: any) => row.total?.toFixed(2) || "0.00" },
    { field: "gstAmount", header: "GST Amount", editable: false, body: (row: any) => row.gstAmount?.toFixed(2) || "0.00" },
    { field: "grandTotal", header: "Grand Total", editable: false, body: (row: any) => row.grandTotal?.toFixed(2) || "0.00" },
  ];


  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-2">
      {/* Supplier & Dates */}
      <div className="flex flex-wrap gap-4 mb-2">
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

      <TTypedSideBarDatatable<PurchaseItemModel>
        columns={columns}
        data={formData.purchaseItems}
        primaryKey="purchaseItemId"
        products={products}
        isSave={false}
      // onSave={onActiveSave}
      // onDelete={onActiveDelete}
      />

      {/* Totals */}
      {/* <div className="absolute bottom-0 right-0 m-4 flex gap-8 bg-gray-50 p-3 rounded shadow">
        <div>Total Amount: ₹{formData.totalAmount.toFixed(2)}</div>
        <div>GST Amount: ₹{formData.gstAmount.toFixed(2)}</div>
        <div>Grand Total: ₹{formData.grandTotal.toFixed(2)}</div>
      </div> */}
    </form>
  );
};
