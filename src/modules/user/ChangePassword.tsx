import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { Password } from "primereact/password";
import { storage } from "../../services/storageService";

const ChangePassword: React.FC = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!password.trim()) errors.password = "Password is required";
        if (!confirmPassword.trim()) errors.confirmPassword = "Confirm password is required";
        if (password && confirmPassword && password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        const user = storage.getUser();
        setLoading(true);

        try {
            const payload = {
                id: Number(user?.userId),
                passwordHash: confirmPassword
            };

            await apiService.put(`/Users/updatepassword/${Number(user?.userId)}`, payload);
            showSuccess("Password changed successfully!");
            setPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            console.error("Error changing password", err);
            showError(err?.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="p-4 max-w-md mx-auto">
            <fieldset className="border border-gray-300 rounded-md p-4 bg-white mb-4">
                <legend className="text-lg font-semibold px-2 text-gray-700">Change Password</legend>

                <div className="flex flex-col gap-4 mt-2">
                    {/* Password */}
                    <div>
                        <strong>Password <span className="mandatory-asterisk">*</span></strong>
                        <Password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            toggleMask
                            className={`w-full mt-1 ${validationErrors.password ? "mandatory-border" : ""}`}
                            placeholder="Enter new password"
                        />
                        {validationErrors.password && (
                            <span className="mandatory-error">{validationErrors.password}</span>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <strong>Confirm Password <span className="mandatory-asterisk">*</span></strong>
                        <Password
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            toggleMask
                            className={`w-full mt-1 ${validationErrors.confirmPassword ? "mandatory-border" : ""}`}
                            placeholder="Confirm new password"
                        />
                        {validationErrors.confirmPassword && (
                            <span className="mandatory-error">{validationErrors.confirmPassword}</span>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button
                        type="button"
                        label="Save"
                        icon="pi pi-save"
                        severity="success"
                        className="p-button-sm"
                        onClick={handleSave}
                        loading={loading}
                    />
                </div>
            </fieldset>
        </form>
    );
};
export default ChangePassword;