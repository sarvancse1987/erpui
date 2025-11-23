import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { UserModel } from "../../models/UserModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";

interface UsersFormProps {
    isEditSidebar: boolean;
    user?: UserModel | null;
    onSaveSuccess?: () => void;
    onCancel?: () => void;
}

export const UsersForm: React.FC<UsersFormProps> = ({
    isEditSidebar,
    user,
    onSaveSuccess,
    onCancel
}) => {
    const [formData, setFormData] = useState<UserModel>({
        username: "",
        passwordHash: "",
        salutation: "Mr.",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        roleId: 0,
        userTypeId: 0,
        companyId: 0,
        locationId: 0,
        isActive: true,
    });

    const [companies, setCompanies] = useState<{ label: string; value: number }[]>([]);
    const [locations, setLocations] = useState<{ label: string; value: number }[]>([]);
    const [roles, setRoles] = useState<{ label: string; value: number }[]>([]);
    const [userTypes, setUserTypes] = useState<{ label: string; value: number }[]>([]);
    const { showSuccess, showError } = useToast();
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        if (user) setFormData(user);
    }, [user]);

    const loadDropdowns = async () => {
        try {
            const companiesRes = await apiService.get("/Company");
            setCompanies(companiesRes?.map((c: any) => ({ label: c.companyName, value: c.id })) ?? []);

            const locationsRes = await apiService.get("/Location");
            setLocations(locationsRes?.map((l: any) => ({ label: l.locationName, value: l.id })) ?? []);

            const rolesRes = await apiService.get("/Role");
            setRoles(rolesRes?.map((r: any) => ({ label: r.roleName, value: r.id })) ?? []);

            const userTypesRes = await apiService.get("/UserType");
            setUserTypes(userTypesRes?.map((u: any) => ({ label: u.userTypeName, value: u.id })) ?? []);
        } catch (err) {
            console.error(err);
            showError("Error loading dropdown data");
        }
    };

    const handleChange = (field: keyof UserModel, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.username) errors.username = "Username is required";
        if (!formData.passwordHash && !user) errors.passwordHash = "Password is required";
        if (!formData.firstName) errors.firstName = "First name is required";
        if (!formData.roleId) errors.roleId = "Role is required";
        if (!formData.userTypeId) errors.userTypeId = "User type is required";
        if (!formData.companyId) errors.companyId = "Company is required";
        if (!formData.locationId) errors.locationId = "Location is required";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveForm = async () => {
        if (!validateForm()) return;

        try {
            if (user) {
                await apiService.put(`/User/${formData.id}`, formData);
                showSuccess("User updated successfully");
            } else {
                await apiService.post("/User", formData);
                showSuccess("User created successfully");
            }
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error(err);
            showError("Error saving user");
        }
    };

    const onCancelSidebar = () => {
        if (onCancel) onCancel();
    };

    return (
        <form onSubmit={handleSaveForm}>
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-1">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    New User
                </legend>

                {/* Row 1 */}
                <div className="flex flex-wrap gap-2 mb-2">
                    <div className="flex-1 min-w-[180px]">
                        <strong>
                            Username <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputText
                            value={formData.username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            className={validationErrors.username ? "p-invalid" : ""}
                        />
                        {validationErrors.username && (
                            <span className="mandatory-error text-xs">{validationErrors.username}</span>
                        )}
                    </div>

                    {!user && (
                        <div className="flex-1 min-w-[180px]">
                            <strong>
                                Password <span className="mandatory-asterisk">*</span>
                            </strong>
                            <InputText
                                type="password"
                                value={formData.passwordHash}
                                onChange={(e) => handleChange("passwordHash", e.target.value)}
                                className={validationErrors.passwordHash ? "p-invalid" : ""}
                            />
                            {validationErrors.passwordHash && (
                                <span className="mandatory-error text-xs">{validationErrors.passwordHash}</span>
                            )}
                        </div>
                    )}

                    <div className="flex-1 min-w-[140px]">
                        <strong>
                            First Name <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputText
                            value={formData.firstName}
                            onChange={(e) => handleChange("firstName", e.target.value)}
                            className={validationErrors.firstName ? "p-invalid" : ""}
                        />
                        {validationErrors.firstName && (
                            <span className="mandatory-error text-xs">{validationErrors.firstName}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <strong>Last Name</strong>
                        <InputText
                            value={formData.lastName}
                            onChange={(e) => handleChange("lastName", e.target.value)}
                        />
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <strong>
                            Company <span className="mandatory-asterisk">*</span>
                        </strong>
                        <Dropdown
                            value={formData.companyId}
                            options={companies}
                            onChange={(e) => handleChange("companyId", e.value)}
                            placeholder="Select Company"
                            className={validationErrors.companyId ? "p-invalid" : ""}
                        />
                        {validationErrors.companyId && (
                            <span className="mandatory-error text-xs">{validationErrors.companyId}</span>
                        )}
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-wrap gap-2 mb-2">
                    <div className="flex-1 min-w-[180px]">
                        <strong>
                            Location <span className="mandatory-asterisk">*</span>
                        </strong>
                        <Dropdown
                            value={formData.locationId}
                            options={locations}
                            onChange={(e) => handleChange("locationId", e.value)}
                            placeholder="Select Location"
                            className={validationErrors.locationId ? "p-invalid" : ""}
                        />
                        {validationErrors.locationId && (
                            <span className="mandatory-error text-xs">{validationErrors.locationId}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <strong>
                            Role <span className="mandatory-asterisk">*</span>
                        </strong>
                        <Dropdown
                            value={formData.roleId}
                            options={roles}
                            onChange={(e) => handleChange("roleId", e.value)}
                            placeholder="Select Role"
                            className={validationErrors.roleId ? "p-invalid" : ""}
                        />
                        {validationErrors.roleId && (
                            <span className="mandatory-error text-xs">{validationErrors.roleId}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <strong>
                            User Type <span className="mandatory-asterisk">*</span>
                        </strong>
                        <Dropdown
                            value={formData.userTypeId}
                            options={userTypes}
                            onChange={(e) => handleChange("userTypeId", e.value)}
                            placeholder="Select Type"
                            className={validationErrors.userTypeId ? "p-invalid" : ""}
                        />
                        {validationErrors.userTypeId && (
                            <span className="mandatory-error text-xs">{validationErrors.userTypeId}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-[100px]">
                        <strong>Active</strong>
                        <Checkbox
                            checked={formData.isActive}
                            onChange={(e) => handleChange("isActive", e.checked)}
                        />
                    </div>
                </div>

                {/* Buttons */}
                {isEditSidebar && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            label="Cancel"
                            icon="pi pi-times"
                            outlined
                            className="p-button-sm"
                            onClick={onCancelSidebar}
                        />
                        <Button
                            type="submit"
                            label={user ? "Update" : "Save"}
                            icon="pi pi-save"
                            className="p-button-sm"
                        />
                    </div>
                )}
            </fieldset>
        </form>

    );
};
