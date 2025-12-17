import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import apiService from "../../services/apiService";
import { CustomerModel } from "../../models/customer/CustomerModel";
import { VoucherFormModel } from "../../models/voucher/VoucherFormModel";
import { VoucherModel } from "../../models/voucher/VoucherModel";
import { CustomerSelector } from "../customer/CustomerSelector";
import { useToast } from "../../components/ToastService";

interface VoucherFormProps {
    voucher: VoucherModel | null;
    validationErrors?: Record<string, string>;
    onSave: () => void;
    onCancel?: () => void;
    isEditSidebar?: boolean;
}

export const VoucherForm: React.FC<VoucherFormProps> = ({
    voucher,
    validationErrors = {},
    onCancel,
    onSave,
    isEditSidebar = false,
}) => {
    const [form, setForm] = useState<VoucherFormModel>({
        voucherId: 0,
        voucherNo: "Voucher",
        voucherDate: new Date(),
        voucherType: 1,
        customerId: null,
        totalDebit: 0,
        totalCredit: 0,
        remarks: ""
    });

    const [voucherTypes, setVoucherTypes] = useState<any[]>([]);
    const [customers, setCustomers] = useState<CustomerModel[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { showSuccess, showError } = useToast();

    const loadMasters = async () => {
        const vt = await apiService.get("/Voucher/voucher-types");
        setVoucherTypes(
            vt.map((x: any) => ({ label: x.name, value: x.value }))
        );

        const cr = await apiService.get("/Customer/details");
        setCustomers(cr?.customers ?? []);
    };

    useEffect(() => {
        loadMasters();
    }, []);

    const parseDate = (value: string | Date | null): Date | null => {
        if (!value) return null;

        if (value instanceof Date) return value;

        const parts = value.split("-");
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);
        return new Date(year, month, day);
    };

    useEffect(() => {
        if (voucher) {
            setForm({
                voucherId: voucher.voucherId,
                voucherNo: voucher.voucherNo ?? "Voucher",
                voucherDate: isEditSidebar ? parseDate(voucher.voucherDate) : parseDate(new Date()),
                voucherType: voucher.voucherType ?? 1,
                customerId: voucher.customerId ?? null,
                totalDebit: voucher.totalDebit ?? 0,
                totalCredit: voucher.totalCredit ?? 0,
                remarks: voucher.remarks ?? ""
            });
        } else {
            setForm({
                voucherId: 0,
                voucherNo: "Voucher",
                voucherDate: new Date(),
                voucherType: 1,
                customerId: null,
                totalDebit: 0,
                totalCredit: 0,
                remarks: ""
            });
        }
    }, [voucher]);

    useEffect(() => {
        if (voucher && customers.length > 0) {
            setForm(prev => ({
                ...prev,
                customerId: voucher.customerId ?? null
            }));
        }
    }, [voucher, customers]);

    const handleChange = (field: keyof VoucherFormModel, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};

        if (!form.voucherDate) errs.voucherDate = "Voucher Date required";
        if (!form.voucherType) errs.voucherType = "Voucher Type required";
        if (!form.customerId) errs.customerId = "Customer required";
        if (form.totalCredit == 0)
            errs.totalCredit = "Amount is required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        if (form.voucherId == 0) {
            var response = await apiService.post("/Voucher", form);
            if (response)
                showSuccess("Voucher saved successfully!");

            onSave();
        } else {
            var response = await apiService.put(`/Voucher/${form.voucherId}`, form);
            if (response)
                showSuccess("Voucher saved successfully!");

            onSave();
        }
    };

    return (
        <div className="border border-gray-200 rounded-md p-1 w-full">
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    Add Voucher
                </legend>

                {!isEditSidebar && (
                    <div className="flex gap-2 mb-3">
                        <Button
                            label="Save"
                            icon="pi pi-save"
                            className="p-button-sm custom-xs"
                            onClick={handleSave}
                        />
                    </div>
                )}

                <div className="flex flex-wrap gap-3 items-end mb-3">

                    <div className="flex-1 min-w-[180px]">
                        <strong className="text-sm">Customer <span className="mandatory-asterisk">*</span></strong>
                        <CustomerSelector
                            customers={customers}
                            selectedCustomerId={form.customerId}
                            onSelect={c => handleChange("customerId", c.customerId)}
                            isValid={!!validationErrors?.customerId}
                        />
                        {errors.customerId && <small className="mandatory-error">{errors.customerId}</small>}
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <strong className="text-sm">Voucher Type <span className="mandatory-asterisk">*</span></strong>
                        <Dropdown
                            value={form.voucherType}
                            options={voucherTypes}
                            onChange={e => handleChange("voucherType", e.value)}
                            className={`w-full mt-1 ${errors.voucherType ? "p-invalid" : ""}`}
                        />
                        {errors.voucherType && <small className="mandatory-error">{errors.voucherType}</small>}
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <strong className="text-sm">Voucher Date <span className="mandatory-asterisk">*</span></strong>
                        <Calendar
                            value={form.voucherDate}
                            onChange={e => handleChange("voucherDate", e.value)}
                            dateFormat="dd-mm-yy"
                            showIcon
                            showButtonBar
                            className={`w-full mt-1 ${errors.voucherDate ? "p-invalid" : ""}`}
                            placeholder="Select voucher date"
                        />
                        {errors.voucherDate && <small className="mandatory-error">{errors.voucherDate}</small>}
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <strong className="text-sm">Amount <span className="mandatory-asterisk">*</span></strong>
                        <InputNumber
                            value={form.totalCredit}
                            mode="currency"
                            currency="INR"
                            locale="en-IN"
                            onChange={e => handleChange("totalCredit", e.value ?? 0)}
                            className="w-full mt-1"
                            placeholder="Amount"
                        />
                        {errors.totalCredit && <small className="mandatory-error">{errors.totalCredit}</small>}
                    </div>

                </div>

                <div>
                    <strong className="text-sm">Remarks</strong>
                    <InputTextarea
                        rows={2}
                        value={form.remarks}
                        onChange={e => handleChange("remarks", e.target.value)}
                        className="w-full mt-1"
                    />
                </div>

                {isEditSidebar && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }} outlined onClick={onCancel} className="p-button-sm custom-xs" />
                        <Button type="submit"
                            label="Update"
                            icon="pi pi-save"
                            severity="success"
                            className="p-button-sm custom-xs" onClick={handleSave} />
                    </div>
                )}

            </fieldset>
        </div>
    );
}
export default VoucherForm;