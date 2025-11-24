import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { UserModel } from "../../models/UserModel";
import apiService from "../../services/apiService";
import { InputMask } from "primereact/inputmask";

interface UsersFormProps {
    user: UserModel;
    index?: number;
    validationErrors?: Record<string, string>;
    onSave: (user: UserModel) => void;
    onCancel?: () => void;
    isEditSidebar?: boolean;
    isAddNewUser?: boolean;
}

export const UsersForm: React.FC<UsersFormProps> = ({
    user,
    index = 0,
    validationErrors = {},
    onSave,
    onCancel,
    isEditSidebar = false,
    isAddNewUser = false
}) => {
    const [formData, setFormData] = useState<UserModel>({ ...user });
    const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});

    const [allCompanies, setAllCompanies] = useState<{ label: string; value: number }[]>([]);
    const [allLocations, setAllLocations] = useState<{ label: string; value: number; companyId: number }[]>([]);
    const [allRoles, setAllRoles] = useState<{ label: string; value: number }[]>([]);
    const [allUserTypes, setAllUserTypes] = useState<{ label: string; value: number }[]>([]);

    const salutationsOptions = [
        { label: "Mr.", value: "Mr." },
        { label: "Mrs.", value: "Mrs." },
        { label: "Ms.", value: "Ms." },
        { label: "Dr.", value: "Dr." }
    ];

    const loadMasterData = async () => {
        try {
            const res = await apiService.get(`/users/getusermaster/${Number(localStorage.getItem("companyId"))}`);

            const companies = (res.companies ?? []).map((c: any) => ({ label: c.name, value: c.id }));
            const locations = (res.locations ?? []).map((l: any) => ({ label: l.name, value: l.id, parentId: l.parentId }));
            const roles = (res.roles ?? []).map((r: any) => ({ label: r.name, value: r.id }));
            const userTypes = (res.userTypes ?? []).map((u: any) => ({ label: u.name, value: u.id }));

            setAllCompanies(companies);
            setAllLocations(res.locations.map((l: any) => ({
                label: l.name,
                value: l.id,
                companyId: l.parentId
            })));
            setAllRoles(roles);
            setAllUserTypes(userTypes);

            // Auto-select if only one option
            setFormData(prev => ({
                ...prev,
                companyId: companies.length === 1 ? companies[0].value : prev.companyId,
                locationId: locations.length === 1 ? locations[0].value : prev.locationId,
                roleId: roles.length === 1 ? roles[0].value : prev.roleId,
                userTypeId: userTypes.length === 1 ? userTypes[0].value : prev.userTypeId,
            }));

        } catch (err) {
            console.error("Error loading user master data", err);
        }
    };

    useEffect(() => {
        loadMasterData();
    }, []);

    useEffect(() => {
        setFormData({ ...user });
    }, [user]);

    useEffect(() => {
        if (allCompanies.length === 1) setFormData(prev => ({ ...prev, companyId: allCompanies[0].value }));
        if (allLocations.length === 1) setFormData(prev => ({ ...prev, locationId: allLocations[0].value }));
    }, [allCompanies, allLocations]);

    const getErrorKey = (field: string) => `user-${index}-${field}`;
    const getErrorMessage = (field: string) => {
        const key = getErrorKey(field);
        if (isEditSidebar || isAddNewUser) return localValidationErrors[key];
        return validationErrors[key];
    };
    const onClearError = (fieldKey: string) => {
        setLocalValidationErrors(prev => {
            const copy = { ...prev };
            delete copy[fieldKey];
            return copy;
        });
    };

    const handleChange = (field: keyof UserModel, value: any) => {
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

    const handleCompanyChange = (companyId: number | null) => {
        setFormData((prev: any) => ({
            ...prev,
            companyId,
            locationId: null, // reset location when company changes
        }));

        // Clear any validation error for company/location
        onClearError(getErrorKey("companyId"));
        onClearError(getErrorKey("locationId"));

        // Auto-select location if only one available for this company
        const filteredLocations = allLocations.filter(l => l.companyId === companyId);
        if (filteredLocations.length === 1) {
            setFormData(prev => ({
                ...prev,
                locationId: filteredLocations[0].value,
            }));
        }

        if (!isEditSidebar && !isAddNewUser && filteredLocations != null) {
            onSave({
                ...formData,
                companyId,
                locationId: filteredLocations.length === 1 ? filteredLocations[0].value : null,
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.username?.trim()) errors[getErrorKey("username")] = "Username is required";
        if (!formData.firstName?.trim()) errors[getErrorKey("firstName")] = "First name is required";
        if (!formData.email?.trim()) errors[getErrorKey("email")] = "Email is required";
        if (!formData.roleId) errors[getErrorKey("roleId")] = "Role is required";
        if (!formData.userTypeId) errors[getErrorKey("userTypeId")] = "User type is required";
        if (!formData.companyId) errors[getErrorKey("companyId")] = "Company is required";
        if (!formData.locationId) errors[getErrorKey("locationId")] = "Location is required";

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
                    {formData.id ? "Edit User" : "Add User"}
                </legend>

                <div className="flex flex-wrap gap-3 p-1">
                    {/* Username */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Username <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("username") ? "mandatory-border" : ""}`}
                            value={formData.username ?? ""}
                            onChange={e => handleChange("username", e.target.value)}
                            placeholder="Username"
                        />
                        {getErrorMessage("username") && <span className="mandatory-error">{getErrorMessage("username")}</span>}
                    </div>

                    {/* First Name */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>First Name <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("firstName") ? "mandatory-border" : ""}`}
                            value={formData.firstName ?? ""}
                            onChange={e => handleChange("firstName", e.target.value)}
                            placeholder="First Name"
                        />
                        {getErrorMessage("firstName") && <span className="mandatory-error">{getErrorMessage("firstName")}</span>}
                    </div>

                    {/* Last Name */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Last Name</strong>
                        <InputText
                            className="w-full mt-1"
                            value={formData.lastName ?? ""}
                            onChange={e => handleChange("lastName", e.target.value)}
                            placeholder="Last Name"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Email <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            className={`w-full mt-1 ${getErrorMessage("email") ? "mandatory-border" : ""}`}
                            value={formData.email ?? ""}
                            onChange={e => handleChange("email", e.target.value)}
                            placeholder="Email"
                        />
                        {getErrorMessage("email") && <span className="mandatory-error">{getErrorMessage("email")}</span>}
                    </div>

                </div>
                <div className="flex flex-wrap gap-3 p-1">

                    {/* Phone */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Phone</strong>
                        <InputMask
                            mask="+99-9999999999"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="+91-9999999999"
                            className="w-full mt-1"
                        />
                    </div>

                    {/* Role */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Role <span className="mandatory-asterisk">*</span></strong>
                        <Dropdown
                            className={`w-full mt-1 ${getErrorMessage("roleId") ? "mandatory-border" : ""}`}
                            value={formData.roleId ?? null}
                            options={allRoles}
                            onChange={e => handleChange("roleId", e.value)}
                            placeholder="Select Role"
                        />
                        {getErrorMessage("roleId") && <span className="mandatory-error">{getErrorMessage("roleId")}</span>}
                    </div>

                    {/* User Type */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>User Type <span className="mandatory-asterisk">*</span></strong>
                        <Dropdown
                            className={`w-full mt-1 ${getErrorMessage("userTypeId") ? "mandatory-border" : ""}`}
                            value={formData.userTypeId ?? null}
                            options={allUserTypes}
                            onChange={e => handleChange("userTypeId", e.value)}
                            placeholder="Select User Type"
                        />
                        {getErrorMessage("userTypeId") && <span className="mandatory-error">{getErrorMessage("userTypeId")}</span>}
                    </div>

                    {/* Company */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Company <span className="mandatory-asterisk">*</span></strong>
                        <Dropdown
                            className={`w-full mt-1 ${getErrorMessage("companyId") ? "mandatory-border" : ""}`}
                            value={formData.companyId ?? null}
                            options={allCompanies}
                            onChange={e => handleCompanyChange(e.value)}
                            placeholder="Select Company"
                        />
                        {getErrorMessage("companyId") && <span className="mandatory-error">{getErrorMessage("companyId")}</span>}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 p-1">
                    <div className="flex-1 min-w-[160px]">
                        <strong>Location <span className="mandatory-asterisk">*</span></strong>
                        <Dropdown
                            className={`w-full mt-1 ${getErrorMessage("locationId") ? "mandatory-border" : ""}`}
                            value={formData.locationId ?? null}
                            options={allLocations.filter(l => !formData.companyId || l.companyId === formData.companyId)}
                            onChange={e => handleChange("locationId", e.value)}
                            placeholder="Select Location"
                        />
                        {getErrorMessage("locationId") && <span className="mandatory-error">{getErrorMessage("locationId")}</span>}
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <strong>Salutation</strong>
                        <Dropdown
                            className="w-full mt-1"
                            value={formData.salutation}
                            options={salutationsOptions}
                            onChange={(e) => setFormData(prev => ({ ...prev, salutation: e.value }))}
                            placeholder="Select Salutation"
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

                <div className="flex justify-end gap-2 mt-4">
                    {onCancel && !isAddNewUser && (
                        <Button
                            type="button"
                            label="Cancel"
                            icon="pi pi-times-circle"
                            style={{ color: 'red' }} outlined
                            onClick={onCancel}
                            className="p-button-sm custom-xs"
                        />
                    )}
                    {isEditSidebar && (
                        <Button
                            type="submit"
                            label="Update"
                            icon="pi pi-save"
                            severity="success"
                            className="p-button-sm custom-xs"
                        />
                    )}
                </div>
            </fieldset>
        </form >
    );
};
