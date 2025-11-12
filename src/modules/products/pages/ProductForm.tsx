import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ProductModel } from "../../../models/product/ProductModel";
import { OptionModel } from "../../../models/product/OptionModel";

interface ProductFormProps {
  product: ProductModel;
  index?: number;
  categories: OptionModel[];
  allGroups: any[];
  allBrands: any[];
  units: OptionModel[];
  validationErrors?: Record<string, string>;
  onSave: (product: ProductModel) => void;     // ✅ Used for both add & edit
  onCancel?: () => void;
  isEditSidebar: boolean;                    // ✅ For sidebar cancel
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  index = 0,
  categories,
  allGroups,
  allBrands,
  units,
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar = false,
}) => {
  const [formData, setFormData] = useState<ProductModel>({ ...product });
  const [filteredGroups, setFilteredGroups] = useState<OptionModel[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<OptionModel[]>([]);

  useEffect(() => {
    if (formData.productCategoryId) {
      const groups = allGroups
        .filter((g) => g.categoryId === formData.productCategoryId && g.isActive)
        .map((g) => ({ label: g.groupName, value: g.groupId }));
      setFilteredGroups(groups);
    }

    if (formData.productGroupId) {
      const brands = allBrands
        .filter((b) => b.groupId === formData.productGroupId && b.isActive)
        .map((b) => ({ label: b.brandName, value: b.brandId }));
      setFilteredBrands(brands);
    }
  }, [formData.productCategoryId, formData.productGroupId, allGroups, allBrands]);

  const updateGSTPrice = (data: ProductModel) => {
    const totalGST = (data.cgstRate ?? 0) + (data.sgstRate ?? 0) + (data.igstRate ?? 0);
    data.gstPrice = data.isGSTIncludedInPrice
      ? data.purchasePrice
      : +(data.purchasePrice + (data.purchasePrice * totalGST) / 100).toFixed(2);
  };

  const handleChange = (field: keyof ProductModel, value: any) => {
    const updated = { ...formData, [field]: value };
    if (
      ["purchasePrice", "cgstRate", "sgstRate", "igstRate", "isGSTIncludedInPrice"].includes(field)
    ) {
      updateGSTPrice(updated);
    }
    setFormData(updated);
  };

  const handleCategoryChange = (categoryId: number) => {
    const groups = allGroups
      .filter((g) => g.categoryId === categoryId && g.isActive)
      .map((g) => ({ label: g.groupName, value: g.groupId }));

    setFilteredGroups(groups);
    setFilteredBrands([]);
    setFormData({
      ...formData,
      productCategoryId: categoryId,
      productGroupId: 0,
      productBrandId: 0,
    });
  };

  const handleGroupChange = (groupId: number) => {
    const brands = allBrands
      .filter((b) => b.groupId === groupId && b.isActive)
      .map((b) => ({ label: b.brandName, value: b.brandId }));

    setFilteredBrands(brands);
    setFormData({
      ...formData,
      productGroupId: groupId,
      productBrandId: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

    const getErrorKey = (field: string) => `product-${index}-${field}`;

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="border border-gray-300 rounded-md p-4 bg-white mb-4">
        <legend className="text-sm font-semibold px-2 text-gray-700">
          {formData.productId ? `Edit Product` : `Add Product`}
        </legend>

        {/* Row 1 */}
        <div className="flex flex-wrap gap-3 p-1">
          {/* Name */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Name <span className="mandatory-asterisk">*</span>
            </strong>
            <InputText
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("productName")] ? "mandatory-border" : ""
              }`}
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
            />
            {validationErrors[getErrorKey("productName")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("productName")]}</span>
            )}
          </div>

          {/* Category */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Category <span className="mandatory-asterisk">*</span>
            </strong>
            <Dropdown
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("productCategoryId")] ? "mandatory-border" : ""
              }`}
              value={formData.productCategoryId}
              options={categories}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleCategoryChange(e.value)}
            />
            {validationErrors[getErrorKey("productCategoryId")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("productCategoryId")]}</span>
            )}
          </div>

          {/* Group */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Group <span className="mandatory-asterisk">*</span>
            </strong>
            <Dropdown
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("productGroupId")] ? "mandatory-border" : ""
              }`}
              value={formData.productGroupId}
              options={filteredGroups}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleGroupChange(e.value)}
            />
            {validationErrors[getErrorKey("productGroupId")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("productGroupId")]}</span>
            )}
          </div>

          {/* Brand */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Brand <span className="mandatory-asterisk">*</span>
            </strong>
            <Dropdown
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("productBrandId")] ? "mandatory-border" : ""
              }`}
              value={formData.productBrandId}
              options={filteredBrands}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange("productBrandId", e.value)}
            />
            {validationErrors[getErrorKey("productBrandId")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("productBrandId")]}</span>
            )}
          </div>

          {/* Unit */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Unit
            </strong>
            <Dropdown
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("primaryUnitId")] ? "mandatory-border" : ""
              }`}
              value={formData.primaryUnitId}
              options={units}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange("primaryUnitId", e.value)}
            />
            {validationErrors[getErrorKey("primaryUnitId")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("primaryUnitId")]}</span>
            )}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap gap-3 p-1">
          {/* Purchase Price */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Purchase Price <span className="mandatory-asterisk">*</span>
            </strong>
            <InputNumber
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("purchasePrice")] ? "mandatory-border" : ""
              }`}
              value={formData.purchasePrice}
              mode="currency"
              currency="INR"
              locale="en-IN"
              onValueChange={(e) => handleChange("purchasePrice", e.value)}
            />
            {validationErrors[getErrorKey("purchasePrice")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("purchasePrice")]}</span>
            )}
          </div>

          {/* Sale Price */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Sale Price <span className="mandatory-asterisk">*</span>
            </strong>
            <InputNumber
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("salePrice")] ? "mandatory-border" : ""
              }`}
              value={formData.salePrice}
              mode="currency"
              currency="INR"
              locale="en-IN"
              onValueChange={(e) => handleChange("salePrice", e.value)}
            />
            {validationErrors[getErrorKey("salePrice")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("salePrice")]}</span>
            )}
          </div>

          {/* GST Price (readonly) */}
          <div className="flex-1 min-w-[140px]">
            <strong>GST Price</strong>
            <InputNumber
              value={formData.gstPrice}
              mode="currency"
              currency="INR"
              locale="en-IN"
              disabled
            />
          </div>

          {/* CGST */}
          <div className="flex-1 min-w-[140px]">
            <strong>CGST %</strong>
            <InputNumber
              className="w-full mt-1"
              value={formData.cgstRate}
              mode="decimal"
              minFractionDigits={0}
              maxFractionDigits={2}
              onValueChange={(e) => handleChange("cgstRate", e.value)}
            />
          </div>

          {/* SGST */}
          <div className="flex-1 min-w-[140px]">
            <strong>SGST %</strong>
            <InputNumber
              className="w-full mt-1"
              value={formData.sgstRate}
              mode="decimal"
              minFractionDigits={0}
              maxFractionDigits={2}
              onValueChange={(e) => handleChange("sgstRate", e.value)}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-wrap gap-3 p-1">
          {/* IGST */}
          <div className="flex-1 min-w-[140px]">
            <strong>IGST %</strong>
            <InputNumber
              className="w-full mt-1"
              value={formData.igstRate}
              mode="decimal"
              minFractionDigits={0}
              maxFractionDigits={2}
              onValueChange={(e) => handleChange("igstRate", e.value)}
            />
          </div>

          {/* HSN */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              HSN Code <span className="mandatory-asterisk">*</span>
            </strong>
            <InputText
              className={`w-full mt-1 ${
                validationErrors[getErrorKey("hsnCode")] ? "mandatory-border" : ""
              }`}
              value={formData.hsnCode}
              onChange={(e) => handleChange("hsnCode", e.target.value)}
            />
            {validationErrors[getErrorKey("hsnCode")] && (
              <span className="mandatory-error">{validationErrors[getErrorKey("hsnCode")]}</span>
            )}
          </div>

          {/* GST Include */}
          <div className="flex items-center gap-2">
            <strong>GST Include</strong>
            <Checkbox
              checked={formData.isGSTIncludedInPrice}
              onChange={(e) => handleChange("isGSTIncludedInPrice", e.checked)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          {onCancel && (
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={onCancel}
            />
          )}
          {isEditSidebar && (
            <Button
              type="submit"
              label={formData.productId ? "Update" : "Save"}
              icon="pi pi-save"
              severity="success"
            />
          )}
        </div>
      </fieldset>
    </form>
  );
};
