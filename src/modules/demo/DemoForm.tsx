import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

interface DemoFormState {
    vertical: string | null;
    businessName: string;
    pincode: string;
    mobileNumber: string;
    numberOfStores: string | null;
    howManyStores: string;
    numberOfEmployees: string;
    remarks: string;
}

const verticalOptions = [
    { label: "Retail Fashion", value: "Retail Fashion" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Wholesale / B2B", value: "Wholesale/B2b" },
    { label: "Departmental Store / Hyper", value: "Departmental Store/Hyper" },
    { label: "E-Commerce", value: "E-Commerce" },
    { label: "FMCG Distributor", value: "FMCG Distributor" },
];

const storeOptions = [
    { label: "Single", value: "single" },
    { label: "Multiple", value: "multiple" },
];

const DemoForm: React.FC = () => {
    const [form, setForm] = useState<DemoFormState>({
        vertical: null,
        businessName: "",
        pincode: "",
        mobileNumber: "",
        numberOfStores: null,
        howManyStores: "",
        numberOfEmployees: "",
        remarks: "",
    });

    const handleChange = (field: keyof DemoFormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">

            {/* Row 1 */}
            <div className="flex flex-wrap gap-3 p-1">
                {/* Vertical */}
                <div className="flex-1 min-w-[220px]">
                    <strong>
                        Select Your Vertical <span className="mandatory-asterisk">*</span>
                    </strong>
                    <Dropdown
                        className="w-full mt-1"
                        value={form.vertical}
                        options={verticalOptions}
                        onChange={(e) => handleChange("vertical", e.value)}
                        placeholder="Select vertical"
                        filter
                        showClear
                    />
                </div>

                {/* Business Name */}
                <div className="flex-1 min-w-[220px]">
                    <strong>
                        Business Name <span className="mandatory-asterisk">*</span>
                    </strong>
                    <InputText
                        className="w-full mt-1"
                        value={form.businessName}
                        onChange={(e) => handleChange("businessName", e.target.value)}
                        placeholder="Business name"
                    />
                </div>

                {/* Pincode */}
                <div className="flex-1 min-w-[160px]">
                    <strong>
                        Pincode <span className="mandatory-asterisk">*</span>
                    </strong>
                    <InputText
                        className="w-full mt-1"
                        value={form.pincode}
                        onChange={(e) => handleChange("pincode", e.target.value)}
                        placeholder="Pincode"
                        keyfilter="int"
                    />
                </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap gap-3 p-1">
                {/* Mobile */}
                <div className="flex-1 min-w-[200px]">
                    <strong>
                        Mobile Number <span className="mandatory-asterisk">*</span>
                    </strong>
                    <InputMask
                        mask="+91-9999999999"
                        className="w-full mt-1"
                        value={form.mobileNumber}
                        onChange={(e) => handleChange("mobileNumber", e.value)}
                        placeholder="+91-XXXXXXXXXX"
                    />
                </div>

                {/* Number of Stores */}
                <div className="flex-1 min-w-[180px]">
                    <strong>
                        Number of Stores <span className="mandatory-asterisk">*</span>
                    </strong>
                    <Dropdown
                        className="w-full mt-1"
                        value={form.numberOfStores}
                        options={storeOptions}
                        onChange={(e) => handleChange("numberOfStores", e.value)}
                        placeholder="Select"
                        showClear
                    />
                </div>

                {/* How Many Stores */}
                {form.numberOfStores === "multiple" && (
                    <div className="flex-1 min-w-[160px]">
                        <strong>How Many Stores?</strong>
                        <InputText
                            className="w-full mt-1"
                            value={form.howManyStores}
                            onChange={(e) => handleChange("howManyStores", e.target.value)}
                            placeholder="Number of stores"
                            keyfilter="int"
                        />
                    </div>
                )}

                {/* Employees */}
                <div className="flex-1 min-w-[160px]">
                    <strong>
                        Number of Employees <span className="mandatory-asterisk">*</span>
                    </strong>
                    <InputText
                        className="w-full mt-1"
                        value={form.numberOfEmployees}
                        onChange={(e) => handleChange("numberOfEmployees", e.target.value)}
                        placeholder="Employees count"
                        keyfilter="int"
                    />
                </div>
            </div>

            {/* Remarks */}
            <div className="flex flex-wrap gap-3 p-1">
                <div className="flex-1 min-w-[300px]">
                    <strong>Remarks</strong>
                    <InputTextarea
                        className="w-full mt-1"
                        value={form.remarks}
                        onChange={(e) => handleChange("remarks", e.target.value)}
                        placeholder="Additional notes"
                        rows={4}
                        autoResize
                    />
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-4">
                <Button
                    type="submit"
                    label="Submit"
                    icon="pi pi-check"
                    className="p-button-primary"
                />
            </div>

        </form>
    );
};

export default DemoForm;
