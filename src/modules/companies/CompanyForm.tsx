import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { CompanyModel } from "../../models/companies/CompanyModel";
import { Dropdown } from "primereact/dropdown";
import apiService from "../../services/apiService";
import { InputMask } from "primereact/inputmask";

interface CompanyFormProps {
    company: CompanyModel;
    index?: number;
    validationErrors?: Record<string, string>;
    onSave: (company: CompanyModel) => void;
    onCancel?: () => void;
    isEditSidebar?: boolean;
    isAddNewCompany?: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
    company,
    index = 0,
    validationErrors = {},
    onSave,
    onCancel,
    isEditSidebar = false,
    isAddNewCompany = false
}) => {

    const [formData, setFormData] = useState<CompanyModel>({ ...company });
    const [localValidationErrors, setLocalValidationErrors] =
        useState<Record<string, string>>({});

    const [allCountries, setAllCountries] = useState<{ label: string; value: number }[]>([]);
    const [allStates, setAllStates] = useState<{ label: string; value: number; countryId: number }[]>([]);
    const [allDistricts, setAllDistricts] = useState<{ label: string; value: number; stateId: number }[]>([]);

    const loadLocationMaster = async () => {
        try {
            const res = await apiService.get(
                "/master/location?isIncludeCountries=true&isIncludeStates=true&isIncludeDistricts=true"
            );

            setAllCountries((res.countries ?? []).map((c: any) => ({
                label: c.countryName,
                value: c.countryId
            })));

            setAllStates((res.states ?? []).map((s: any) => ({
                label: s.stateName,
                value: s.stateId,
                countryId: s.countryId
            })));

            setAllDistricts((res.districts ?? []).map((d: any) => ({
                label: d.districtName,
                value: d.districtId,
                stateId: d.stateId
            })));
        } catch (err) {
            console.error("Error loading location master", err);
        }
    };

    useEffect(() => {
        loadLocationMaster();
    }, []);

    useEffect(() => {
        setFormData({ ...company });
    }, [company]);

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

    const getErrorKey = (field: string) => `company-${index}-${field}`;

    const getErrorMessage = (field: string) => {
        const key = getErrorKey(field);

        if (isEditSidebar || isAddNewCompany) return localValidationErrors[key];
        return validationErrors[key];
    };

    const onClearError = (fieldKey: string) => {
        setLocalValidationErrors(prev => {
            const copy = { ...prev };
            delete copy[fieldKey];
            return copy;
        });
    };

    const handleChange = (field: keyof CompanyModel, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);

        const errorKey = getErrorKey(field);

        const key = getErrorKey(field);
        if (isEditSidebar && localValidationErrors[key])
            onClearError(key);


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

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name?.trim())
            errors[getErrorKey("name")] = "Company Name is required";

        if (!formData.phone?.trim())
            errors[getErrorKey("phone")] = "Phone is required";

        if (formData.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                errors[getErrorKey("email")] = "Invalid email format";
            }
        }

        setLocalValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    {formData.id ? "Edit Company" : "Add Company"}
                </legend>

                {/* Input Fields */}
                <div className="flex flex-wrap gap-3 p-1">

                    {/* Company Name */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Company Name <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("name") ? "mandatory-border" : ""}`}
                            value={formData.name ?? ""}
                            onChange={e => handleChange("name", e.target.value)}
                            placeholder="Company name"
                        />
                        {getErrorMessage("name") && (
                            <span className="mandatory-error">{getErrorMessage("name")}</span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Phone <span className="mandatory-asterisk">*</span></strong>
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
                            className="w-full mt-1"
                            value={formData.email ?? ""}
                            onChange={e => handleChange("email", e.target.value)}
                            placeholder="Email"
                        />
                    </div>

                    {/* Address */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Address</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.address ?? ""}
                            onChange={e => handleChange("address", e.target.value)}
                            placeholder="Address"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 p-1">
                    {/* City */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>City</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.city ?? ""}
                            onChange={e => handleChange("city", e.target.value)}
                            placeholder="City"
                        />
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>Country</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.countryId ?? null}
                            options={allCountries}
                            onChange={(e) => handleChange("countryId", e.value)}
                            filter
                            showClear
                            placeholder="Country"
                        />
                    </div>

                    {/* State */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>State</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.stateId ?? null}
                            options={allStates.filter(s => !formData.countryId || s.countryId === formData.countryId)}
                            onChange={(e) => handleChange("stateId", e.value)}
                            filter
                            showClear
                            placeholder="State"
                        />
                    </div>

                    {/* District */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>District</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.districtId ?? null}
                            options={allDistricts.filter(d => !formData.stateId || d.stateId === formData.stateId)}
                            onChange={(e) => handleChange("districtId", e.value)}
                            filter
                            showClear
                            placeholder="District"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 p-1">
                    {/* GST */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>GST Number</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.gstNumber ?? ""}
                            onChange={e => handleChange("gstNumber", e.target.value)}
                            placeholder="Gst Number"
                        />
                    </div>

                    {/* Website */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Website</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.website ?? ""}
                            onChange={e => handleChange("website", e.target.value)}
                            placeholder="Website"
                        />
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-2 mt-3">
                        <Checkbox
                            checked={formData.isActive ?? false}
                            onChange={e => handleChange("isActive", e.checked)}
                        />
                        <strong>Is Active</strong>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    {onCancel && !isAddNewCompany && (
                        <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }}
                            outlined onClick={onCancel} className="p-button-sm custom-xs" />
                    )}

                    {isEditSidebar && (
                        <Button type="submit" label="Update" icon="pi pi-save"
                            severity="success"
                            className="p-button-sm custom-xs" />
                    )}
                </div>
            </fieldset>
        </form>
    );
};
