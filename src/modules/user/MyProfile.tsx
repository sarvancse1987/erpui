import React, { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { UserModel } from "../../models/UserModel";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import "../../asset/style/MyProfileFileUpload.css";
import CustomWebcam from "../webcam/CustomWebcam";
import { MyProfileModel } from "../../models/MyProfileModel";
import { useToast } from "../../components/ToastService";
import { storage } from "../../services/storageService";

const MyProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserModel>({} as UserModel);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const uploadRef = useRef<FileUpload>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { showSuccess } = useToast();

    const salutationsOptions = [
        { label: "Mr.", value: "Mr." },
        { label: "Mrs.", value: "Mrs." },
        { label: "Ms.", value: "Ms." },
        { label: "Dr.", value: "Dr." },
    ];

    // ---------------------- Load Profile ----------------------
    const loadProfile = async () => {
        const user = storage.getUser();
        try {
            const res = await apiService.get(`/Users/${Number(user?.userId)}`);
            setProfile(res.data);

            if (res.data.userImage) {
                const apiBaseUrl = process.env.REACT_APP_SERVICE_API_BASE_URL?.replace("/api", "") || "";
                setPreviewUrl(`${apiBaseUrl}${res.data.userImage}`);
            }
        } catch (err) {
            console.error("Error loading profile", err);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // ---------------------- Form Change ----------------------
    const handleChange = (field: keyof UserModel, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));

        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    };

    // ---------------------- Validation ----------------------
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!profile.firstName?.trim()) errors.firstName = "First name is required";
        if (!profile.email?.trim()) errors.email = "Email is required";

        if (profile.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profile.email.trim())) {
                errors.email = "Invalid email format";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ---------------------- Save Profile ----------------------
    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            let uploadedFileUrl = profile.userImage ?? null;

            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadRes: any = await apiService.upload(
                    "/users/upload/uploaduserprofile",
                    formData
                );

                uploadedFileUrl = uploadRes?.fileUrl || uploadedFileUrl;
            }

            const updatedProfile: MyProfileModel = {
                email: profile.email,
                firstName: profile.firstName,
                salutation: profile.salutation,
                id: profile.id,
                lastName: profile.lastName ?? "",
                phone: profile.phone,
                userImage: uploadedFileUrl,
            };

            await apiService.put(`/users/updateprofile/${updatedProfile.id}`, updatedProfile);

            showSuccess("Profile updated successfully");

            const userImageDto = {
                imageBase64: previewUrl,
                id: profile.id
            };
            var response = await apiService.post("/users/upload-image", userImageDto);
            if (response) {
                const apiBaseUrl = process.env.REACT_APP_SERVICE_API_BASE_URL?.replace("/api", "") || "";
                storage.updateUserImage(`${apiBaseUrl}${response.fileUrl}`);
            }

            storage.updateUserProfileName(profile.firstName, profile.lastName);
        } catch (err) {
            console.error("Error saving profile", err);
        } finally {
            setLoading(false);
        }
    };

    // ---------------------- File Upload ----------------------
    const onSelect = (e: FileUploadSelectEvent) => {
        const file = e.files[0];
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        uploadRef.current?.clear();
    };

    const openFileDialog = () => {
        uploadRef.current?.getInput()?.click();
    };

    // ===========================================================
    // ===================== RENDER UI ============================
    // ===========================================================

    return (
        <form className="p-4 max-w-2xl mx-auto">
            <fieldset className="border border-gray-300 rounded-md p-4 bg-white mb-4">
                <legend className="text-lg font-semibold px-2 text-gray-700">My Profile</legend>

                {/* Profile Fields */}
                <div className="flex flex-wrap gap-4">

                    {/* Salutation */}
                    <div className="flex-1 min-w-[120px]">
                        <strong>Salutation</strong>
                        <Dropdown
                            value={profile.salutation}
                            options={salutationsOptions}
                            onChange={e => handleChange("salutation", e.value)}
                            placeholder="Select Salutation"
                            className="w-full mt-1"
                        />
                    </div>

                    {/* First Name */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>First Name <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            value={profile.firstName ?? ""}
                            onChange={e => handleChange("firstName", e.target.value)}
                            className={`w-full mt-1 ${validationErrors.firstName ? "mandatory-border" : ""}`}
                            placeholder="First Name"
                        />
                        {validationErrors.firstName && (
                            <span className="mandatory-error">{validationErrors.firstName}</span>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Last Name</strong>
                        <InputText
                            value={profile.lastName ?? ""}
                            onChange={e => handleChange("lastName", e.target.value)}
                            className="w-full mt-1"
                            placeholder="Last Name"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Email <span className="mandatory-asterisk">*</span></strong>
                        <InputText
                            value={profile.email ?? ""}
                            onChange={e => handleChange("email", e.target.value)}
                            className={`w-full mt-1 ${validationErrors.email ? "mandatory-border" : ""}`}
                            placeholder="Email"
                        />
                        {validationErrors.email && (
                            <span className="mandatory-error">{validationErrors.email}</span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="flex-1 min-w-[160px]">
                        <strong>Phone</strong>
                        <InputMask
                            mask="+99-9999999999"
                            value={profile.phone}
                            onChange={e => handleChange("phone", e.target.value)}
                            placeholder="+91-9999999999"
                            className="w-full mt-1"
                        />
                    </div>
                </div>

                {/* Image Section */}
                <div className="flex justify-end mt-4">
                    <div className="flex flex-col gap-4">

                        {/* Upload Box */}
                        {!previewUrl && (
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
                        {previewUrl && (
                            <div className="relative" style={{ width: 176, height: 176 }}>
                                <div className="block" style={{ width: 176, height: 176, border: "1px dotted #999" }}>
                                    <div className="relative w-full h-full">
                                        <img
                                            src={previewUrl}
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
                                                setPreviewUrl(null);
                                                setSelectedFile(null);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Webcam */}
                        <CustomWebcam
                            onCapture={(img) => {
                                setPreviewUrl(img);
                                setSelectedFile(null);
                            }}
                        />

                    </div>
                </div>

                {/* Save Button */}
                <div className="w-full">
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            label="Save"
                            icon="pi pi-save"
                            severity="success"
                            className="p-button-sm custom-xs"
                            onClick={handleSave}
                            loading={loading}
                        />
                    </div>
                </div>

            </fieldset>
        </form>
    );
};
export default MyProfile;