import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { InventoryUpdateModel } from "../../models/inventory/InventoryUpdateModel";
import apiService from "../../services/apiService";
import { ProductModel } from "../../models/product/ProductModel";
import { useToast } from "../../components/ToastService";

interface InventoryUpdateFormProps {
    onCancel?: () => void;
    onSave?: (isSuccess: boolean) => void;
    data?: InventoryUpdateModel;
}

const InventoryUpdateForm: React.FC<InventoryUpdateFormProps> = ({
    onCancel,
    onSave,
    data
}) => {
    const [products, setProducts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const { showSuccess, showError } = useToast();
    const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        productId: null as number | null,
        salePrice: 0,
        availableQuantity: 0,
        supplierId: null as number | null,
        inventoryId: null as number | null
    });

    const loadSuppliers = async () => {
        try {
            const hierarchy = await apiService.get(
                "/ProductCategory/hierarchy?includeCategories=false&includeGroups=false&includeBrands=false&includeProducts=true"
            );
            const initialProducts: ProductModel[] = hierarchy.products ?? [];
            setProducts(initialProducts.map((u: ProductModel) => ({ label: `${u.productName}`, value: u.productId })));

            const suppliers = await apiService.get("/Supplier/getallsupplier");
            setSuppliers((suppliers?.suppliers ?? []).map((u: any) => ({ label: `${u.supplierName}`, value: u.supplierId })));
        } catch (err) {
            console.error("Error loading suppliers:", err);
        } finally {
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    useEffect(() => {
        if (!data) return;

        setForm(prev => ({
            ...prev,
            productId: data.productId,
            availableQuantity: data.availableQuantity,
            salePrice: data.previousPurchasePrice ?? 0,
            supplierId: data.inventorySupplierId ?? 0,
            inventoryId: data.inventoryId
        }));
    }, [data]);

    const getErrorKey = (field: string) => `${field}`;
    const onClearError = (fieldKey: string) => {
        setLocalValidationErrors((prev) => {
            const copy = { ...prev };
            delete copy[fieldKey];
            return copy;
        });
    };

    const getErrorMessage = (field: string) => {
        const key = getErrorKey(field);
        return localValidationErrors[key];
    };

    const handleChange = (
        field: keyof InventoryUpdateModel,
        value: any
    ) => {
        setForm(prev => ({ ...prev, [field]: value }));


        const key = getErrorKey(field);
        if (localValidationErrors[key]) {
            onClearError(key);
        }
    };

    const handleSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!form.productId) {
            errors.productId = "Product required";
        }

        if (!form.salePrice || form.salePrice <= 0) {
            errors.salePrice = "Sale price required";
        }

        if (form.availableQuantity === null || form.availableQuantity <= 0) {
            errors.quantity = "Available quantity required";
        }

        setLocalValidationErrors(errors);


        if (Object.keys(errors).length > 0) return;

        const input = {
            inventoryId: form.inventoryId,
            purchasePrice: form.salePrice,
            productId: form.productId,
            quantity: form.availableQuantity,
            supplierId: form.supplierId
        };
        const response = await apiService.put(`/Inventory/${form.inventoryId}`, input);
        if (response) {
            showSuccess("Inventory updated successfully");
            onSave?.(false);
        }
    }

    return (
        <>
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    Edit Inventory
                </legend>
                <div className="flex flex-wrap mb-2 items-end">

                    {/* Product */}
                    <div className="col-12 md:col-6">
                        <strong className="text-sm">
                            Product <span className="mandatory-asterisk">*</span>
                        </strong>
                        <Dropdown
                            value={form.productId}
                            options={products}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Product"
                            className={`w-full mt-1 ${getErrorMessage("productId") ? "mandatory-border" : ""}`}
                            onChange={(e) => handleChange("productId", e.value)}
                            filter
                            showClear
                        />
                        {getErrorMessage("productId") && (
                            <span className="mandatory-error">{getErrorMessage("productId")}</span>
                        )}
                    </div>

                    {/* Sale Price */}
                    <div className="col-12 md:col-3">
                        <strong className="text-sm">
                            Sale Price <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputNumber
                            value={form.salePrice}
                            onValueChange={(e) => handleChange("salePrice", e.value ?? 0)}
                            mode="currency"
                            currency="INR"
                            locale="en-IN"
                            className={`w-full mt-1 ${getErrorMessage("salePrice") ? "mandatory-border" : ""}`}
                            placeholder="Sale Price"
                        />
                        {getErrorMessage("salePrice") && (
                            <span className="mandatory-error">{getErrorMessage("salePrice")}</span>
                        )}
                    </div>

                    {/* Available Qty */}
                    <div className="col-12 md:col-3">
                        <strong className="text-sm">
                            Available Qty <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputNumber
                            value={form.availableQuantity}
                            onValueChange={(e) => handleChange("availableQuantity", e.value ?? 0)}
                            className={`w-full mt-1 ${getErrorMessage("availableQuantity") ? "mandatory-border" : ""}`}
                            mode="currency"
                            currency="INR"
                            locale="en-IN"
                            placeholder="Available Qty"
                        />
                        {getErrorMessage("availableQuantity") && (
                            <span className="mandatory-error">{getErrorMessage("availableQuantity")}</span>
                        )}
                    </div>

                    {/* Supplier */}
                    <div className="col-12 md:col-6">
                        <strong className="text-sm">Supplier</strong>
                        <Dropdown
                            value={form.supplierId}
                            options={suppliers}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Supplier"
                            className="w-full"
                            onChange={(e) => handleChange("supplierId", e.value)}
                            filter
                            showClear
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        type="button"
                        label="Cancel"
                        icon="pi pi-times-circle"
                        outlined
                        severity="danger"
                        className="p-button-sm custom-xs"
                        onClick={onCancel}
                    />

                    <Button
                        type="button"
                        label="Update"
                        icon="pi pi-save"
                        severity="success"
                        className="p-button-sm custom-xs"
                        onClick={handleSubmit}
                    />
                </div>
            </fieldset>
        </>
    );
};

export default InventoryUpdateForm;
