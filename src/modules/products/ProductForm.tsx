import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ProductModel } from "../../models/product/ProductModel";
import { OptionModel } from "../../models/product/OptionModel";
import { handleEnterKey } from "../../common/common";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import CustomWebcam from "../webcam/CustomWebcam";
import "../../asset/style/MyProfileFileUpload.css";

interface ProductFormProps {
  product: ProductModel;
  index?: number;
  categories: OptionModel[];
  allGroups: any[];
  allBrands: any[];
  units: OptionModel[];
  suppliers: OptionModel[];
  validationErrors?: Record<string, string>;
  onSave: (product: ProductModel) => void;
  onCancel?: () => void;
  isEditSidebar: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  index = 0,
  categories,
  allGroups,
  allBrands,
  units,
  suppliers,
  validationErrors = {},
  onSave,
  onCancel,
  isEditSidebar = false,
}) => {
  const [formData, setFormData] = useState<ProductModel>({ ...product });
  const [filteredGroups, setFilteredGroups] = useState<OptionModel[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<OptionModel[]>([]);
  const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});
  const uploadRef = useRef<FileUpload>(null);
  const [webcamKey, setWebcamKey] = useState(0);
  const imageObjectUrlRef = useRef<string | null>(null);
  const [isDatabase, setIsDatabase] = useState<boolean>(false);

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

  useEffect(() => {
    setFormData({ ...product });

    // Also reset groups & brands when starting a new product
    if (!product.productCategoryId) setFilteredGroups([]);
    if (!product.productGroupId) setFilteredBrands([]);

    setLocalValidationErrors({});
    if (product.imagePreviewUrl) {
      setIsDatabase(true);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
      }
    };
  }, []);

  const updateGSTPrice = (data: ProductModel) => {
    const totalGST = (data.cgstRate ?? 0) + (data.sgstRate ?? 0) + (data.igstRate ?? 0);
    data.gstPrice = data.isGSTIncludedInPrice
      ? data.purchasePrice
      : +(data.purchasePrice + (data.purchasePrice * totalGST) / 100).toFixed(2);
    if (data.cgstRate > 0 || data.sgstRate > 0) {
      data.isGSTIncludedInPrice = true;
    }
  };

  const onClearError = (fieldKey: string) => {
    setLocalValidationErrors((prevErrors) => {
      if (!prevErrors[fieldKey]) return prevErrors;
      const newErrors = { ...prevErrors };
      delete newErrors[fieldKey];
      return newErrors;
    });
  };

  const handleChange = (field: keyof ProductModel, value: any) => {
    const updated = { ...formData, [field]: value };

    if (["purchasePrice", "cgstRate", "sgstRate", "igstRate", "isGSTIncludedInPrice"].includes(field)) {
      updateGSTPrice(updated);
    }

    setFormData(updated);

    const errorKey = getErrorKey(field);

    if (isEditSidebar) {
      if (localValidationErrors[errorKey]) {
        const newErrors = { ...localValidationErrors };
        delete newErrors[errorKey];
        setLocalValidationErrors(newErrors);
      }
    } else {
      if (validationErrors[errorKey]) {
        validationErrors[errorKey] = "";
        onClearError(errorKey);
      }
    }
    if (!isEditSidebar)
      onSave(updated);
  };


  const handleCategoryChange = (categoryId: number) => {
    const groups = allGroups
      .filter((g) => g.categoryId === categoryId && g.isActive)
      .map((g) => ({ label: g.groupName, value: g.groupId }));
    setFilteredGroups(groups);
    setFilteredBrands([]);
    setFormData({ ...formData, productCategoryId: categoryId, productGroupId: 0, productBrandId: 0 });
  };

  const handleGroupChange = (groupId: number) => {
    const brands = allBrands
      .filter((b) => b.groupId === groupId && b.isActive)
      .map((b) => ({ label: b.brandName, value: b.brandId }));
    setFilteredBrands(brands);
    setFormData({ ...formData, productGroupId: groupId, productBrandId: 0 });
  };

  const getErrorKey = (field: string) => `product-${index}-${field}`;

  const getErrorMessage = (field: string) =>
    isEditSidebar ? localValidationErrors[getErrorKey(field)] : validationErrors[getErrorKey(field)];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.productName?.trim()) errors[getErrorKey("productName")] = "Product Name is required";
    if (!formData.productCategoryId) errors[getErrorKey("productCategoryId")] = "Category is required";
    if (!formData.productGroupId) errors[getErrorKey("productGroupId")] = "Group is required";
    if (!formData.productBrandId) errors[getErrorKey("productBrandId")] = "Brand is required";
    if (!formData.purchasePrice || formData.purchasePrice <= 0) errors[getErrorKey("purchasePrice")] = "Purchase Price is required";
    if (!formData.salePrice || formData.salePrice <= 0) errors[getErrorKey("salePrice")] = "Sale Price is required";
    if (!formData.primaryUnitId || formData.primaryUnitId <= 0) errors[getErrorKey("primaryUnitId")] = "Unit is required";
    if (!formData.hsnCode?.trim()) errors[getErrorKey("hsnCode")] = "HSN Code is required";

    if (Object.keys(errors).length > 0) {
      setLocalValidationErrors(errors);
      return false;
    }

    setLocalValidationErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  const onSelect = (e: FileUploadSelectEvent) => {
    const file = e.files[0];
    if (!file) return;

    setIsDatabase(false);
    // Revoke old URL if exists
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    imageObjectUrlRef.current = url;

    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imagePreviewUrl: url,
    }));

    uploadRef.current?.clear();
  };

  const openFileDialog = () => {
    uploadRef.current?.getInput()?.click();
  };

  const apiBaseUrl = process.env.REACT_APP_SERVICE_API_BASE_URL?.replace("/api", "") || "";

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-1">
        <legend className="text-sm font-semibold px-2 text-gray-700">
          {formData.productId ? "Edit Product" : "Add Product"}
        </legend>

        {/* Row 1 */}
        <div className="flex flex-wrap gap-3 p-1">
          <div className="flex-1 min-w-[140px]">
            <strong>
              Name <span className="mandatory-asterisk">*</span>
            </strong>
            <InputText
              className={`w-full mt-1 ${getErrorMessage("productName") ? "mandatory-border" : ""}`}
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              placeholder="Product name"
              tabIndex={1}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("productName") && <span className="mandatory-error">{getErrorMessage("productName")}</span>}
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>
              Category <span className="mandatory-asterisk">*</span>
            </strong>
            <Dropdown
              className={`w-full mt-1 ${getErrorMessage("productCategoryId") ? "p-invalid" : ""}`}
              value={formData.productCategoryId}
              options={categories}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange("productCategoryId", e.value)}
              filter
              showClear
              filterBy="label,value"
              placeholder="Select category"
              tabIndex={2}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("productCategoryId") && <span className="mandatory-error">{getErrorMessage("productCategoryId")}</span>}
          </div>

          {/* Group */}
          <div className="flex-1 min-w-[140px]">
            <strong>
              Group <span className="mandatory-asterisk">*</span>
            </strong>
            <Dropdown
              className={`w-full mt-1 ${getErrorMessage("productGroupId") ? "p-invalid" : ""}`}
              value={formData.productGroupId}
              options={filteredGroups}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange("productGroupId", e.value)}
              filter
              showClear
              filterBy="label,value"
              placeholder="Select group"
              tabIndex={3}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("productGroupId") && <span className="mandatory-error">{getErrorMessage("productGroupId")}</span>}
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>
              Brand <span className="mandatory-asterisk">*</span>
            </strong>
            <Dropdown
              className={`w-full mt-1 ${getErrorMessage("productBrandId") ? "p-invalid" : ""}`}
              value={formData.productBrandId}
              options={filteredBrands}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange("productBrandId", e.value)}
              filter
              showClear
              filterBy="label,value"
              placeholder="Select brand"
              tabIndex={4}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("productBrandId") && <span className="mandatory-error">{getErrorMessage("productBrandId")}</span>}
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>Unit</strong>
            <Dropdown
              className={`w-full mt-1 ${getErrorMessage("primaryUnitId") ? "p-invalid" : ""}`}
              value={formData.primaryUnitId}
              options={units}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange("primaryUnitId", e.value)}
              filter
              showClear
              filterBy="label,value"
              placeholder="select unit"
              tabIndex={5}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("primaryUnitId") && <span className="mandatory-error">{getErrorMessage("primaryUnitId")}</span>}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap gap-3 p-1">
          <div className="flex-1 min-w-[140px]">
            <strong>Purchase Price <span className="mandatory-asterisk">*</span></strong>
            <InputNumber
              className={`w-full mt-1 ${getErrorMessage("purchasePrice") ? "mandatory-border" : ""}`}
              value={formData.purchasePrice}
              mode="currency"
              currency="INR"
              locale="en-IN"
              onValueChange={(e) => handleChange("purchasePrice", e.value)}
              placeholder="Purchase price"
              tabIndex={6}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("purchasePrice") && <span className="mandatory-error">{getErrorMessage("purchasePrice")}</span>}
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>Sale Price <span className="mandatory-asterisk">*</span></strong>
            <InputNumber
              className={`w-full mt-1 ${getErrorMessage("salePrice") ? "mandatory-border" : ""}`}
              value={formData.salePrice}
              mode="currency"
              currency="INR"
              locale="en-IN"
              onValueChange={(e) => handleChange("salePrice", e.value)}
              placeholder="Sale price"
              tabIndex={7}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("salePrice") && <span className="mandatory-error">{getErrorMessage("salePrice")}</span>}
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>GST Price</strong>
            <InputNumber value={formData.gstPrice} mode="currency" currency="INR" locale="en-IN" disabled className="w-full mt-1" />
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>CGST %</strong>
            <InputNumber
              className="w-full mt-1"
              value={formData.cgstRate}
              mode="decimal"
              minFractionDigits={0}
              maxFractionDigits={2}
              onValueChange={(e) => handleChange("cgstRate", e.value)}
              placeholder="CGST%"
              tabIndex={8}
              onKeyDown={handleEnterKey}
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>SGST %</strong>
            <InputNumber
              className="w-full mt-1"
              value={formData.sgstRate}
              mode="decimal"
              minFractionDigits={0}
              maxFractionDigits={2}
              onValueChange={(e) => handleChange("sgstRate", e.value)}
              placeholder="SGST%"
              tabIndex={9}
              onKeyDown={handleEnterKey}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-wrap gap-3 p-1">
          <div className="flex-1 min-w-[140px]">
            <strong>IGST %</strong>
            <InputNumber
              className="w-full mt-1"
              value={formData.igstRate}
              mode="decimal"
              minFractionDigits={0}
              maxFractionDigits={2}
              onValueChange={(e) => handleChange("igstRate", e.value)}
              placeholder="IGST%"
              tabIndex={10}
              onKeyDown={handleEnterKey}
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>HSN Code <span className="mandatory-asterisk">*</span></strong>
            <InputText
              className={`w-full mt-1 ${getErrorMessage("hsnCode") ? "mandatory-border" : ""}`}
              value={formData.hsnCode}
              onChange={(e) => handleChange("hsnCode", e.target.value)}
              placeholder="HSN Code"
              tabIndex={11}
              onKeyDown={handleEnterKey}
            />
            {getErrorMessage("hsnCode") && <span className="mandatory-error">{getErrorMessage("hsnCode")}</span>}
          </div>

          <div className="flex-1 min-w-[140px]">
            <strong>Supplier</strong>
            <Dropdown
              className={`w-full mt-1`}
              value={formData.supplierId}
              options={suppliers}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange("supplierId", e.value)}
              filter
              showClear
              filterBy="label,value"
              placeholder="Select supplier"
              tabIndex={12}
              onKeyDown={handleEnterKey}
            />
          </div>

          <div className="flex items-center gap-2 mt-5">
            <strong>GST Include</strong>
            <Checkbox
              checked={formData.isGSTIncludedInPrice}
              onChange={(e) => handleChange("isGSTIncludedInPrice", e.checked)}
              tabIndex={13}
              onKeyDown={handleEnterKey}
            />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <strong>List Product Page</strong>
            <Checkbox
              checked={formData.isListOut ?? false}
              onChange={(e) => handleChange("isListOut", e.checked)}
              tabIndex={13}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 p-1">

          {/* Image Section */}
          <div className="flex justify-end mt-4">
            <div className="flex flex-col gap-4">

              {/* Upload Box */}
              {(!formData.imagePreviewUrl || formData.imagePreviewUrl == "") && (
                <div className="upload-dropzone" onClick={openFileDialog}>
                  <i className="pi pi-upload"></i>
                  <p className="text-main">Upload Image</p>
                  <p className="text-sub">PNG / JPG / JPEG</p>
                </div>
              )}

              <FileUpload
                ref={uploadRef}
                name="file"
                mode="basic"
                customUpload
                auto={false}
                accept="image/*"
                maxFileSize={2_000_000}
                onSelect={onSelect}
                className="hidden"
              />

              {/* Final Preview Box */}
              {formData.imagePreviewUrl && (
                <div className="relative" style={{ width: 176, height: 176 }}>
                  <div className="block" style={{ width: 176, height: 176, border: "1px dotted #999" }}>
                    <div className="relative w-full h-full">

                      <img
                        src={isDatabase == true ? apiBaseUrl + formData.imagePreviewUrl : formData.imagePreviewUrl}
                        alt="preview"
                        className="w-full h-full rounded-lg object-cover border"
                      />

                      <Button
                        type="button"
                        icon="pi pi-times-circle"
                        severity="danger"
                        text
                        className="absolute -top-2 -right-2 p-2 rounded-full"
                        onClick={() => {
                          const clearedProduct = {
                            ...formData,
                            imagePreviewUrl: null,
                            imageFile: null,
                          };
                          setIsDatabase(false);
                          setFormData(clearedProduct);
                          onSave(clearedProduct);       // ✅ ONE update only
                          setWebcamKey(prev => prev + 1);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Webcam */}
              <CustomWebcam
                key={webcamKey}
                onCapture={(img) => {
                  setIsDatabase(false);
                  handleChange("imagePreviewUrl", img);
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {onCancel && <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }} outlined onClick={onCancel} className="p-button-sm custom-xs" />}
          {isEditSidebar && (
            <Button
              type="submit"
              label={formData.productId ? "Update" : "Save"}
              icon="pi pi-save"
              className="p-button-sm custom-xs"
            />
          )}
        </div>
      </fieldset>
    </form >
  );
};
