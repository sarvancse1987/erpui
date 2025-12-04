import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import apiService from "../../services/apiService";
import { LocationModel } from "../../models/LocationModel";
import { storage } from "../../services/storageService";
import { handleEnterKey } from "../../common/common";

interface LocationFormProps {
    location: LocationModel;
    index?: number;
    validationErrors?: Record<string, string>;
    onSave: (loc: LocationModel) => void;
    onCancel?: () => void;
    isEditSidebar?: boolean;
    isAddNewLocation?: boolean;
}

export const LocationForm: React.FC<LocationFormProps> = ({
    location,
    index = 0,
    validationErrors = {},
    onSave,
    onCancel,
    isEditSidebar = false,
    isAddNewLocation = false
}) => {

    const [formData, setFormData] = useState<LocationModel>({ ...location });
    const [localValidationErrors, setLocalValidationErrors] =
        useState<Record<string, string>>({});

    const [companies, setCompanies] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const user = storage.getUser();

    const loadLocationMaster = async () => {
        try {
            const res = await apiService.get(
                "/master/location?isIncludeCountries=true&isIncludeStates=true&isIncludeDistricts=true"
            );

            setCountries((res.countries ?? []).map((c: any) => ({
                label: c.countryName, value: c.countryId
            })));

            setStates((res.states ?? []).map((s: any) => ({
                label: s.stateName, value: s.stateId, countryId: s.countryId
            })));

            setDistricts((res.districts ?? []).map((d: any) => ({
                label: d.districtName, value: d.districtId, stateId: d.stateId
            })));
        } catch (err) {
            console.error("Error loading master", err);
        }
    };

    const loadAllCompanies = async () => {
        const res = await apiService.get(`/company/getallcompany/${Number(user?.companyId)}`);
        setCompanies((res.companies ?? []).map((c: any) => ({
            label: c.name, value: c.id
        })));
    }

    useEffect(() => {
        if (countries.length === 0 || states.length === 0) return;

        setFormData(prev => {
            const updated = { ...prev };

            // Default Country → India
            if (!updated.countryId) {
                const india = countries.find(c =>
                    c.label.toLowerCase() === "india"
                );
                if (india) updated.countryId = india.value;
            }

            // Default State → Tamil Nadu
            if (!updated.stateId && updated.countryId) {
                const tamilnadu = states.find(s =>
                    s.label.toLowerCase() === "tamil nadu" &&
                    s.countryId === updated.countryId
                );
                if (tamilnadu) updated.stateId = tamilnadu.value;
            }

            return updated;
        });
    }, [countries, states]);

    useEffect(() => {
        loadLocationMaster();
        loadAllCompanies();
    }, []);

    useEffect(() => setFormData({ ...location }), [location]);

    const getErrorKey = (field: string) => `location-${index}-${field}`;

    const getErrorMessage = (field: string) => {
        const key = getErrorKey(field);

        if (isEditSidebar || isAddNewLocation) return localValidationErrors[key];
        return validationErrors[key];
    };

    const onClearError = (fieldKey: string) => {
        setLocalValidationErrors(prev => {
            const copy = { ...prev };
            delete copy[fieldKey];
            return copy;
        });
    };

    const handleChange = (field: keyof LocationModel, value: any) => {
        const updated = { ...formData, [field]: value };
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

    const validateForm = () => {
        const err: Record<string, string> = {};

        if (formData.companyId == 0)
            err[getErrorKey("companyId")] = "Company name is required";

        if (!formData.name?.trim())
            err[getErrorKey("name")] = "Location name is required";

        if (!formData.phone?.trim())
            err[getErrorKey("phone")] = "Phone is required";

        if (formData.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email))
                err[getErrorKey("email")] = "Invalid email";
        }

        setLocalValidationErrors(err);
        return Object.keys(err).length === 0;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSave(formData);
    };

    return (
        <form onSubmit={submit}>
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    {formData.id ? "Edit Location" : "Add Location"}
                </legend>

                <div className="flex flex-wrap gap-3 p-1">

                    {/* Country */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Company Name<span className="mandatory-asterisk">*</span></strong>
                        <Dropdown
                            className={`w-full mt-1 ${getErrorMessage("companyId") ? "mandatory-border" : ""}`}
                            value={formData.companyId ?? null}
                            options={companies}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => handleChange("companyId", e.value)}
                            filter
                            showClear
                            filterBy="label,value"
                            placeholder="Company name"
                            tabIndex={1}
                            onKeyDown={handleEnterKey}
                        />
                        {getErrorMessage("companyId") && <span className="mandatory-error">{getErrorMessage("companyId")}</span>}
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>Location Name <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("name") ? "mandatory-border" : ""}`}
                            value={formData.name ?? ""}
                            onChange={e => handleChange("name", e.target.value)}
                            placeholder="Location name"
                            tabIndex={2}
                            onKeyDown={handleEnterKey}
                        />
                        {getErrorMessage("name") && (
                            <span className="mandatory-error">{getErrorMessage("name")}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>Phone <span className="mandatory-asterisk">*</span></strong>
                        <InputMask
                            mask="+99-9999999999"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.value)}
                            className={`w-full mt-1 ${getErrorMessage("phone") ? "mandatory-border" : ""}`}
                            placeholder="Phone"
                            tabIndex={3}
                            onKeyDown={handleEnterKey}
                        />
                        {getErrorMessage("phone") && (
                            <span className="mandatory-error">{getErrorMessage("phone")}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>Email</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.email ?? ""}
                            onChange={e => handleChange("email", e.target.value)}
                            placeholder="Email"
                            tabIndex={4}
                            onKeyDown={handleEnterKey}
                        />
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>Address</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.address ?? ""}
                            onChange={e => handleChange("address", e.target.value)}
                            placeholder="Address"
                            tabIndex={5}
                            onKeyDown={handleEnterKey}
                        />
                    </div>

                </div>
                <div className="flex flex-wrap gap-3 p-1">
                    <div className="flex-1 min-w-[160px]">
                        <strong>Pincode</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.pincode ?? ""}
                            onChange={e => handleChange("pincode", e.target.value)}
                            placeholder="Pincode"
                            tabIndex={6}
                            onKeyDown={handleEnterKey}
                        />
                    </div>

                    {/* Country */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Country</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.countryId ?? null}
                            options={countries}
                            onChange={(e) => handleChange("countryId", e.value)}
                            filter
                            showClear
                            placeholder="Select country"
                            tabIndex={7}
                            onKeyDown={handleEnterKey}
                        />
                    </div>

                    {/* State */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>State</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.stateId ?? null}
                            options={states.filter(s => !formData.countryId || s.countryId === formData.countryId)}
                            onChange={(e) => handleChange("stateId", e.value)}
                            filter
                            showClear
                            placeholder="Select state"
                            tabIndex={8}
                            onKeyDown={handleEnterKey}
                        />
                    </div>

                    {/* District */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>District</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.districtId ?? null}
                            options={districts.filter(d => !formData.stateId || d.stateId === formData.stateId)}
                            onChange={(e) => handleChange("districtId", e.value)}
                            filter
                            showClear
                            placeholder="Select district"
                            tabIndex={9}
                            onKeyDown={handleEnterKey}
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <Checkbox
                            checked={formData.isActive ?? true}
                            onChange={(e) => handleChange("isActive", e.checked)}
                            tabIndex={10}
                            onKeyDown={handleEnterKey}
                        />
                        <strong>Active</strong>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    {onCancel && !isAddNewLocation && (
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
