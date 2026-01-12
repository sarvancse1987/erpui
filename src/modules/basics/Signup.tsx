import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import apiService from "../../services/apiService";
import { SignupSeedInputModel } from "../../models/authentication/SignupSeedInputModel";
import { useNavigate } from "react-router-dom";
import { InputMask } from "primereact/inputmask";

export const Signup = () => {
    const [form, setForm] = useState({
        companyName: "",
        companyPhone: "",
        companyEmail: "",
        address: "",
        city: "",
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        userEmail: "",
        userPhone: ""
    });

    const [submitted, setSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ✅ Email validation function
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // ✅ Form validation
    const isValid = () => {
        if (
            !form.companyName ||
            !form.companyPhone ||
            !form.companyEmail ||
            !form.firstName ||
            !form.username ||
            !form.password ||
            !form.userEmail
        ) {
            return false;
        }

        if (!isValidEmail(form.companyEmail) || !isValidEmail(form.userEmail)) {
            return false;
        }

        return true;
    };

    const signup = async () => {
        setSubmitted(true);
        setErrorMessage(null);
        setSuccessMessage(null);


        if (!isValid()) return;

        const payload: SignupSeedInputModel = {
            companyName: form.companyName,
            companyAddress: `${form.address || ""} ${form.city || ""}`.trim(),
            locationName: "Head Office",
            locationAddress: `${form.address || ""} ${form.city || ""}`.trim(),
            companyEmail: form.companyEmail,
            companyPhone: form.companyPhone,
            adminUsername: form.username,
            adminPassword: form.password,
            adminEmail: form.userEmail,
            adminFirstName: form.firstName,
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
                    companyEmail: "",
                    address: "",
                    city: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    password: "",
                    userEmail: "",
                    userPhone: ""
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
            <div className="w-full xl:w-10">
                <Card
                    title={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-user-plus" />
                            <span>Signup</span>
                        </span>
                    }
                >
                    <div className="grid">

                        {/* LEFT - COMPANY */}
                        <div className="col-12 md:col-6 flex">
                            <Card
                                title={<><i className="pi pi-building mr-2" />Company</>}
                                className="w-full h-full"
                            >
                                {/* Company Name */}
                                <label className="font-medium">Company Name <span className="mandatory-asterisk">*</span></label>
                                <InputText
                                    name="companyName"
                                    value={form.companyName}
                                    onChange={onChange}
                                    className={classNames("w-full mb-2", {
                                        "p-invalid": submitted && !form.companyName
                                    })}
                                    placeholder="Company name"
                                    tabIndex={1}
                                />
                                {submitted && !form.companyName && (
                                    <small className="p-error">Company Name is required</small>
                                )}

                                {/* Company Email */}
                                <label className="font-medium mt-3 block">Company Email <span className="mandatory-asterisk">*</span></label>
                                <InputText
                                    name="companyEmail"
                                    value={form.companyEmail}
                                    onChange={onChange}
                                    className={classNames("w-full mb-2", {
                                        "p-invalid": submitted && (!form.companyEmail || !isValidEmail(form.companyEmail))
                                    })}
                                    placeholder="Company email"
                                    tabIndex={2}
                                />
                                {submitted && !form.companyEmail && (
                                    <small className="p-error">Company Email is required</small>
                                )}
                                {submitted && form.companyEmail && !isValidEmail(form.companyEmail) && (
                                    <small className="p-error">Invalid Company Email format</small>
                                )}

                                {/* Company Phone */}
                                <label className="font-medium mt-3 block">Company Phone <span className="mandatory-asterisk">*</span></label>
                                <InputMask
                                    name="companyPhone"
                                    id="companyPhone"
                                    mask="+99-9999999999"
                                    value={form.companyPhone}
                                    onChange={onChange}
                                    placeholder="+91-9999999999"
                                    className="w-full mt-1"
                                    tabIndex={3}
                                />
                                {submitted && !form.companyPhone && (
                                    <small className="p-error">Company Phone is required</small>
                                )}
                            </Card>
                        </div>

                        {/* RIGHT - USER */}
                        <div className="col-12 md:col-6 flex">
                            <Card
                                title={<><i className="pi pi-user mr-2" />Admin User</>}
                                className="w-full h-full"
                            >
                                {/* First Name */}
                                <label className="font-medium">First Name <span className="mandatory-asterisk">*</span></label>
                                <InputText
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={onChange}
                                    className={classNames("w-full mb-2", {
                                        "p-invalid": submitted && !form.firstName
                                    })}
                                    placeholder="First name"
                                    tabIndex={4}
                                />
                                {submitted && !form.firstName && (
                                    <small className="p-error">First Name is required</small>
                                )}

                                <div className="grid mt-2">
                                    {/* Username */}
                                    <div className="col-12 md:col-6">
                                        <label className="font-medium">Username <span className="mandatory-asterisk">*</span></label>
                                        <InputText
                                            name="username"
                                            value={form.username}
                                            onChange={onChange}
                                            className={classNames("w-full mb-2", {
                                                "p-invalid": submitted && !form.username
                                            })}
                                            placeholder="Username"
                                            tabIndex={5}
                                        />
                                        {submitted && !form.username && (
                                            <small className="p-error">Username is required</small>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="col-12 md:col-3">
                                        <label className="font-medium">Password <span className="mandatory-asterisk">*</span></label>
                                        <Password
                                            name="password"
                                            value={form.password}
                                            onChange={onChange}
                                            toggleMask
                                            feedback={false}
                                            className={classNames("w-full mb-2", {
                                                "p-invalid": submitted && !form.password
                                            })}
                                            placeholder="Password"
                                            tabIndex={6}
                                        />
                                        {submitted && !form.password && (
                                            <small className="p-error">Password is required</small>
                                        )}
                                    </div>
                                </div>

                                {/* User Email */}
                                <label className="font-medium mt-3 block">User Email <span className="mandatory-asterisk">*</span></label>
                                <InputText
                                    name="userEmail"
                                    value={form.userEmail}
                                    onChange={onChange}
                                    className={classNames("w-full mb-2", {
                                        "p-invalid": submitted && (!form.userEmail || !isValidEmail(form.userEmail))
                                    })}
                                    placeholder="User email"
                                    tabIndex={7}
                                />
                                {submitted && !form.userEmail && (
                                    <small className="p-error">User Email is required</small>
                                )}
                                {submitted && form.userEmail && !isValidEmail(form.userEmail) && (
                                    <small className="p-error">Invalid User Email format</small>
                                )}
                            </Card>
                        </div>

                        {/* CENTER BUTTON */}
                        <div className="col-12 flex justify-content-center mt-4">
                            <Button
                                label="Create"
                                icon="pi pi-check"
                                onClick={signup}
                                className="px-6"
                                loading={loading}
                            />
                        </div>

                        {successMessage && (
                            <div className="col-12 flex justify-content-center mt-2">
                                <small className="p-success font-medium text-green">
                                    {successMessage}
                                </small>
                            </div>
                        )}

                        <div className="col-12 flex justify-content-center mt-1">
                            {errorMessage && (
                                <small className="p-error block mt-2 text-center">
                                    {errorMessage}
                                </small>
                            )}
                        </div>

                    </div>
                </Card>
            </div>
        </div>
    );
};
