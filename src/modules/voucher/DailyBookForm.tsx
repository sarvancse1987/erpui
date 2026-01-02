import { useEffect, useState } from "react";
import { CompanyLedgerModel } from "../../models/companies/CompanyLedgerModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import { LedgerTransactionType } from "../../models/companies/LedgerTransactionType";

interface DailyBookFormProps {
    onSave: (isSaved: boolean) => void;
    onCancel?: () => VoidFunction;
    isEditSidebar: boolean;
}

const DailyBookForm: React.FC<DailyBookFormProps> = ({ isEditSidebar, onSave, onCancel }) => {
    const [form, setForm] = useState<CompanyLedgerModel>({
        companyLedgerId: 0,
        transactionDate: new Date(),
        companyLedgerCategoryId: null,
        description: "",
        debit: 0,
        credit: 0,
        paymentMode: "",
        isOpeningEntry: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const [categoryType, setCategoryType] = useState<string>("");
    const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
    const { showSuccess, showError } = useToast();

    const loadMasters = async () => {
        const vt = await apiService.get("/CompanyLedger/GetCompanyLedgerCategory");
        setCategoryOptions(
            vt.map((x: any) => ({ label: x.companyLedgerCategoryName, value: x.companyLedgerCategoryId }))
        );

        const suppliersRes = await apiService.get("/Supplier/getallsupplier");
        if (suppliersRes && suppliersRes.status) {
            setSuppliers(suppliersRes.suppliers.map((x: any) => ({ label: x.supplierName, value: x.supplierId })) ?? []);
        }
    };

    useEffect(() => {
        loadMasters();
    }, []);

    const handleChange = (field: keyof CompanyLedgerModel, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};

        if (!form.transactionDate) errs.transactionDate = "Transaction Date required";
        if (!form.companyLedgerCategoryId) errs.companyLedgerCategoryId = "Transaction Type required";
        if (!form.credit || form.credit == 0) errs.credit = "Amount required";
        if (categoryType && categoryType == LedgerTransactionType.Purchase && !form.supplierId)
            errs.supplierId = "Supplier name required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        if (form.companyLedgerCategoryId == 0) {
            var response = await apiService.post("/CompanyLedger", form);
            if (response)
                showSuccess("Company Ledger saved successfully!");

            onSave(true);
        } else {
            var response = await apiService.put(`/CompanyLedger/${form.companyLedgerCategoryId}`, form);
            if (response)
                showSuccess("Company Ledger saved successfully!");

            onSave(true);
        }
    };

    const onCategoryChange = (eventValue: number) => {
        const selectedOption = categoryOptions.find(
            (opt) => opt.value === eventValue
        );
        setCategoryType(selectedOption.label);
    }

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
                        <strong className="text-sm">Transaction Date <span className="mandatory-asterisk">*</span></strong>
                        <Calendar
                            value={form.transactionDate}
                            onChange={e => handleChange("transactionDate", e.value)}
                            dateFormat="dd-mm-yy"
                            showIcon
                            showButtonBar
                            className={`w-full mt-1 ${errors.transactionDate ? "p-invalid" : ""}`}
                            placeholder="Select transaction date"
                        />
                        {errors.transactionDate && <small className="mandatory-error">{errors.transactionDate}</small>}
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <strong className="text-sm">Transaction Type <span className="mandatory-asterisk">*</span></strong>
                        <Dropdown
                            value={form.companyLedgerCategoryId}
                            options={categoryOptions}
                            onChange={(e) => {
                                handleChange("companyLedgerCategoryId", e.value);
                                onCategoryChange(e.value);
                            }}
                            className={`w-full mt-1 ${errors.companyLedgerCategoryId ? "p-invalid" : ""}`}
                            placeholder="Transaction type"
                        />
                        {errors.companyLedgerCategoryId && <small className="mandatory-error">{errors.companyLedgerCategoryId}</small>}
                    </div>

                    {categoryType && categoryType == LedgerTransactionType.Purchase && (
                        <div className="flex-1 min-w-[180px]">
                            <strong className="text-sm">Supplier Name <span className="mandatory-asterisk">*</span></strong>
                            <Dropdown
                                value={form.supplierId}
                                options={suppliers}
                                onChange={(e) => {
                                    handleChange("supplierId", e.value);
                                }}
                                className={`w-full mt-1 ${errors.supplierId ? "p-invalid" : ""}`}
                                placeholder="Supplier"
                            />
                            {errors.supplierId && <small className="mandatory-error">{errors.supplierId}</small>}
                        </div>)}

                    <div className="flex-1 min-w-[180px]">
                        <strong className="text-sm">Transaction Amount <span className="mandatory-asterisk">*</span></strong>
                        <InputNumber
                            value={form.credit}
                            mode="currency"
                            currency="INR"
                            locale="en-IN"
                            onChange={e => handleChange("credit", e.value ?? 0)}
                            className={`w-full mt-1 ${errors.credit ? "p-invalid" : ""}`}
                            placeholder="Amount"
                        />
                        {errors.credit && <small className="mandatory-error">{errors.credit}</small>}
                    </div>

                </div>

                <div>
                    <strong className="text-sm">Remarks</strong>
                    <InputTextarea
                        rows={2}
                        value={form.description}
                        onChange={e => handleChange("description", e.target.value)}
                        className="w-full mt-1"
                    />
                </div>

                {isEditSidebar && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }} outlined onClick={onCancel} className="p-button-sm custom-xs" />
                        <Button type="submit"
                            label="Update"
                            icon="pi pi-save"
                            className="p-button-sm custom-xs" onClick={handleSave} />
                    </div>
                )}

            </fieldset>
        </div>
    );
};

export default DailyBookForm;
