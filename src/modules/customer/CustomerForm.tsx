import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import apiService from "../../services/apiService";
import { CustomerModel } from "../../models/customer/CustomerModel";

interface CustomerFormProps {
    customer: CustomerModel;
    index?: number;
    validationErrors?: Record<string, string>;
    onSave: (customer: CustomerModel) => void;
    onCancel?: () => void;
    isEditSidebar?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
    customer,
    index = 0,
    validationErrors = {},
    onSave,
    onCancel,
    isEditSidebar = false,
}) => {
    const [formData, setFormData] = useState<CustomerModel>({ ...customer });
    const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});

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
        setFormData({ ...customer });
    }, [customer]);

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

    const getErrorKey = (field: string) => `customer-${index}-${field}`;
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

    const handleChange = (field: keyof CustomerModel, value: any) => {
        const updated = { ...formData, [field]: value };

        if (field === "countryId") {
            updated.stateId = null;
            updated.districtId = null;
        }
        if (field === "stateId") {
            updated.districtId = null;
        }

        setFormData(updated);

        const key = getErrorKey(field);
        if (isEditSidebar && localValidationErrors[key]) onClearError(key);

        if (!isEditSidebar) onSave(updated);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.customerName?.trim())
            errors[getErrorKey("customerName")] = "Customer Name is required";

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
            <fieldset className="border border-gray-300 rounded-md p-4 bg-white mb-4">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    {formData.customerId ? "Edit Customer" : "Add Customer"}
                </legend>

                <div className="flex flex-wrap gap-3 p-1">
                    {/* Customer Name */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Customer Name <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("customerName") ? "mandatory-border" : ""}`}
                            value={formData.customerName}
                            onChange={(e) => handleChange("customerName", e.target.value)}
                        />
                        {getErrorMessage("customerName") && (
                            <span className="mandatory-error">{getErrorMessage("customerName")}</span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Phone</strong>
                        <InputText
                            className={`w-full mt-1}`}
                            value={formData.phone ?? ""}
                            onChange={(e) => handleChange("phone", e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Email</strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("email") ? "mandatory-border" : ""}`}
                            value={formData.email ?? ""}
                            onChange={(e) => handleChange("email", e.target.value)}
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
                            value={formData.gstNumber ?? ""}
                            onChange={(e) => handleChange("gstNumber", e.target.value)}
                        />
                    </div>
                </div>

                {/* Address Section */}
                <div className="flex flex-wrap gap-3 p-1">
                    <div className="flex-1 min-w-[160px]">
                        <strong>Address</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.address ?? ""}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>City</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.city ?? ""}
                            onChange={(e) => handleChange("city", e.target.value)}
                        />
                    </div>

                    {/* Country */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Country</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.countryId ?? null}
                            options={allCountries}
                            onChange={(e) => handleChange("countryId", e.value)}
                            filter
                            showClear
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
                        />
                    </div>

                    {/* Postal Code */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Postal Code</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.postalCode ?? ""}
                            onChange={(e) => handleChange("postalCode", e.target.value)}
                        />
                    </div>

                </div>

                <div className="flex justify-end gap-2 mt-4">
                    {onCancel && (
                        <Button type="button" label="Cancel" icon="pi pi-times" outlined onClick={onCancel} />
                    )}
                    {isEditSidebar && (
                        <Button type="submit" label="Save" icon="pi pi-save" severity="success" />
                    )}
                </div>
            </fieldset>
        </form>
    );
};
