import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import { InputMask } from "primereact/inputmask";
import { Dropdown } from "primereact/dropdown";
import apiService from "../../services/apiService";

interface SupplierFormProps {
    supplier: SupplierModel;
    index?: number;
    validationErrors?: Record<string, string>;
    onSave: (supplier: SupplierModel) => void;
    onCancel?: () => void;
    isEditSidebar?: boolean;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
    supplier,
    index = 0,
    validationErrors = {},
    onSave,
    onCancel,
    isEditSidebar = false,
}) => {
    const [formData, setFormData] = useState<SupplierModel>({ ...supplier });

    const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});
    const [allCountries, setAllCountries] = useState<{ label: string; value: number }[]>([]);
    const [allStates, setAllStates] = useState<{ label: string; value: number, countryId: number }[]>([]);
    const [allDistricts, setAllDistricts] = useState<{ label: string; value: number, stateId: number }[]>([]);

    // ---------------------------------------------------
    // Load Country, State, District from Master API
    // ---------------------------------------------------
    const loadLocationMaster = async () => {
        try {
            const res = await apiService.get(
                "/master/location?isIncludeCountries=true&isIncludeStates=true&isIncludeDistricts=true"
            );

            setAllCountries((res.countries ?? []).map((c: any) => ({ label: c.countryName, value: c.countryId })));
            setAllStates((res.states ?? []).map((s: any) => ({ label: s.stateName, value: s.stateId, countryId: s.countryId })));
            setAllDistricts((res.districts ?? []).map((d: any) => ({ label: d.districtName, value: d.districtId, stateId: d.stateId })));
        } catch (err) {
            console.error("Error loading location master", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            await loadLocationMaster();
        };

        init();
    }, []);

    useEffect(() => {
        if (allCountries.length === 0 || allStates.length === 0) return;

        setFormData(prev => {
            const updated = { ...prev };

            // Default Country → India
            if (!updated.countryId) {
                const india = allCountries.find(c =>
                    c.label.toLowerCase() === "india"
                );
                if (india) updated.countryId = india.value;
            }

            // Default State → Tamil Nadu
            if (!updated.stateId && updated.countryId) {
                const tamilnadu = allStates.find(s =>
                    s.label.toLowerCase() === "tamil nadu" &&
                    s.countryId === updated.countryId
                );
                if (tamilnadu) updated.stateId = tamilnadu.value;
            }

            return updated;
        });
    }, [allCountries, allStates]);


    useEffect(() => {
        setFormData({ ...supplier });
    }, [supplier]);

    // ---------------------------------------------------
    // KEY → ERROR MAPPING
    // ---------------------------------------------------
    const getErrorKey = (field: string) => `supplier-${index}-${field}`;

    const getErrorMessage = (field: string) => {
        const key = getErrorKey(field);
        return isEditSidebar ? localValidationErrors[key] : validationErrors[key];
    };

    const onClearError = (fieldKey: string) => {
        setLocalValidationErrors((prev) => {
            const copy = { ...prev };
            delete copy[fieldKey];
            return copy;
        });
    };

    // ---------------------------------------------------
    // Common Change Handler
    // ---------------------------------------------------
    const handleChange = (field: keyof SupplierModel, value: any) => {
        const updated = { ...formData, [field]: value };

        // Reset dependent dropdowns
        if (field === "countryId") {
            updated.stateId = null;
            updated.districtId = null;
        }
        if (field === "stateId") {
            updated.districtId = null;
        }

        setFormData(updated);

        const key = getErrorKey(field);
        if (isEditSidebar) {
            if (localValidationErrors[key]) onClearError(key);
        } else {
            if (validationErrors[key]) validationErrors[key] = "";
        }

        if (!isEditSidebar) onSave(updated);
    };

    // ---------------------------------------------------
    // Validation
    // ---------------------------------------------------
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.supplierName?.trim())
            errors[getErrorKey("supplierName")] = "Supplier Name is required";

        if (!formData.contactPerson?.trim())
            errors[getErrorKey("contactPerson")] = "Contact Person is required";

        if (!formData.phone?.trim())
            errors[getErrorKey("phone")] = "Phone number is required";

        // Optional email but validate if given
        if (formData.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                errors[getErrorKey("email")] = "Invalid email format";
            }
        }

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

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------
    return (
        <form onSubmit={handleSubmit}>
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    {formData.supplierId ? "Edit Supplier" : "Add Supplier"}
                </legend>

                <div className="flex flex-wrap gap-3 p-1">
                    {/* Supplier Name */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>
                            Supplier Name <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("supplierName") ? "mandatory-border" : ""}`}
                            value={formData.supplierName}
                            onChange={(e) => handleChange("supplierName", e.target.value)}
                            placeholder="Supplier name"
                        />
                        {getErrorMessage("supplierName") && (
                            <span className="mandatory-error">{getErrorMessage("supplierName")}</span>
                        )}
                    </div>

                    {/* Contact Person */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>
                            Contact Person <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("contactPerson") ? "mandatory-border" : ""}`}
                            value={formData.contactPerson}
                            onChange={(e) => handleChange("contactPerson", e.target.value)}
                            placeholder="Contact person"
                        />
                        {getErrorMessage("contactPerson") && (
                            <span className="mandatory-error">{getErrorMessage("contactPerson")}</span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>
                            Phone <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputMask
                            mask="+99-9999999999"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="+91-9999999999"
                            className={`w-full mt-1 ${getErrorMessage("phone") ? "mandatory-border" : ""}`}
                        />
                        {getErrorMessage("phone") && (
                            <span className="mandatory-error">{getErrorMessage("phone")}</span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Email</strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("email") ? "mandatory-border" : ""}`}
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="Email"
                        />
                        {getErrorMessage("email") && (
                            <span className="mandatory-error">{getErrorMessage("email")}</span>
                        )}
                    </div>

                    {/* GST */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>GST Number</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.gstNumber}
                            onChange={(e) => handleChange("gstNumber", e.target.value)}
                            placeholder="GST number"
                        />
                    </div>
                </div>

                {/* Address Section */}
                <div className="flex flex-wrap gap-3 p-1">
                    <div className="flex-1 min-w-[160px]">
                        <strong>Address</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            placeholder="Address"
                        />
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>City</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            placeholder="City"
                        />
                    </div>

                    {/* Country */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Country</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.countryId}
                            options={allCountries}
                            onChange={(e) => handleChange("countryId", e.value)}
                            showClear
                            filter
                            placeholder="Select country"
                        />
                    </div>

                    {/* State */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>State</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.stateId}
                            options={allStates.filter((s) => !formData.countryId || s.countryId === formData.countryId)}
                            onChange={(e) => handleChange("stateId", e.value)}
                            showClear
                            filter
                            placeholder="Select state"
                        />
                    </div>

                    {/* District */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>District</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.districtId ?? null}
                            options={allDistricts.filter((d) => !formData.stateId || d.stateId === formData.stateId)}
                            onChange={(e) => handleChange("districtId", e.value ?? null)}
                            showClear
                            filter
                            placeholder="Select district"
                        />
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>Postal Code</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.postalCode}
                            onChange={(e) => handleChange("postalCode", e.target.value)}
                            placeholder="Postal code"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-5">
                        <Checkbox
                            checked={formData.isActive}
                            onChange={(e) => handleChange("isActive", e.checked ?? false)}
                        />
                        <label>Active</label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    {onCancel && (
                        <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }}
                            outlined onClick={onCancel} className="p-button-sm custom-xs" />
                    )}
                    {isEditSidebar && (
                        <Button type="submit" label="Save" icon="pi pi-save" severity="success" className="p-button-sm custom-xs" />
                    )}
                </div>
            </fieldset>
        </form>
    );
};
export default SupplierForm;