import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { InputMask } from "primereact/inputmask";
import apiService from "../../services/apiService";
import { SignupSeedInputModel } from "../../models/authentication/SignupSeedInputModel";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
    const [form, setForm] = useState({
        companyName: "",
        companyPhone: "",
        email: "",
        firstName: "",
        username: "",
        password: ""
    });

    const [submitted, setSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValid = () => {
        if (
            !form.companyName ||
            !form.companyPhone ||
            !form.email ||
            !form.firstName ||
            !form.username ||
            !form.password
        ) return false;

        if (!isValidEmail(form.email)) return false;

        return true;
    };

    const signup = async () => {
        setSubmitted(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!isValid()) return;

        const payload: SignupSeedInputModel = {
            companyName: form.companyName,
            companyPhone: form.companyPhone,
            email: form.email,
            locationName: "Head Office",

            username: form.username,
            password: form.password,
            firstName: form.firstName,
            createdBy: "signup"
        };

        try {
            setLoading(true);
            const response = await apiService.post("/Users/signup", payload);

            if (response && response.status) {
                setSuccessMessage(
                    "Signup successful! Please check your email for login details and then log in."
                );
                setErrorMessage(null);
                setSubmitted(false);
                setForm({
                    companyName: "",
                    companyPhone: "",
                    email: "",
                    firstName: "",
                    username: "",
                    password: ""
                });
            } else {
                setErrorMessage(response.error || "Signup failed");
            }
        } catch (err) {
            console.error("Signup failed", err);
            setErrorMessage("Signup failed due to server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 flex justify-content-center">
            <div className="w-full md:w-6">
                <Card
                    title={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-user-plus" />
                            <span>Signup</span>
                        </span>
                    }
                >
                    {/* Company Name */}
                    <div className="field">
                        <label className="font-medium">Company Name <span className="star">*</span></label>
                        <InputText
                            name="companyName"
                            value={form.companyName}
                            onChange={onChange}
                            className={classNames("w-full", {
                                "p-invalid": submitted && !form.companyName
                            })}
                        />
                        <small className="p-error block min-h-1rem">
                            {submitted && !form.companyName && "Company Name is required"}
                        </small>
                    </div>

                    {/* Email */}
                    <div className="field">
                        <label className="font-medium">Email <span className="star">*</span></label>
                        <InputText
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            className={classNames("w-full", {
                                "p-invalid":
                                    submitted &&
                                    (!form.email || !isValidEmail(form.email))
                            })}
                        />
                        <small className="p-error block min-h-1rem">
                            {submitted && !form.email && "Email is required"}
                            {submitted && form.email && !isValidEmail(form.email) &&
                                "Invalid email format"}
                        </small>
                    </div>

                    {/* Phone */}
                    <div className="field">
                        <label className="font-medium">Phone <span className="star">*</span></label>
                        <InputMask
                            name="companyPhone"
                            mask="+99-9999999999"
                            value={form.companyPhone}
                            onChange={onChange}
                            className={classNames("w-full", {
                                "p-invalid": submitted && !form.companyPhone
                            })}
                        />
                        <small className="p-error block min-h-1rem">
                            {submitted && !form.companyPhone && "Phone number is required"}
                        </small>
                    </div>

                    {/* First Name */}
                    <div className="field">
                        <label className="font-medium">First Name <span className="star">*</span></label>
                        <InputText
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            className={classNames("w-full", {
                                "p-invalid": submitted && !form.firstName
                            })}
                        />
                        <small className="p-error block min-h-1rem">
                            {submitted && !form.firstName && "First Name is required"}
                        </small>
                    </div>

                    {/* Username */}
                    <div className="field">
                        <label className="font-medium">Username <span className="star">*</span></label>
                        <InputText
                            name="username"
                            value={form.username}
                            onChange={onChange}
                            className={classNames("w-full", {
                                "p-invalid": submitted && !form.username
                            })}
                        />
                        <small className="p-error block min-h-1rem">
                            {submitted && !form.username && "Username is required"}
                        </small>
                    </div>

                    {/* Password */}
                    <div className="field">
                        <label className="font-medium">Password <span className="star">*</span></label>
                        <Password
                            name="password"
                            value={form.password}
                            onChange={onChange}
                            toggleMask
                            feedback={false}
                            className={classNames("w-full", {
                                "p-invalid": submitted && !form.password
                            })}
                        />
                        <small className="p-error block min-h-1rem">
                            {submitted && !form.password && "Password is required"}
                        </small>
                    </div>

                    {/* Submit */}
                    <Button
                        label="Signup"
                        icon="pi pi-check"
                        className="w-full mt-2 flex justify-center gap-2"
                        onClick={signup}
                        loading={loading}
                    />

                    {/* Messages */}
                    {successMessage && (
                        <small className="block text-green text-center mt-2">
                            {successMessage}
                        </small>
                    )}
                    {errorMessage && (
                        <small className="p-error block text-center mt-2">
                            {errorMessage}
                        </small>
                    )}
                </Card>
            </div>
        </div>
    );
};
