import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { useToast } from "../../components/ToastService";
import { DailyExpenseModel } from "../../models/voucher/DailyExpenseModel";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { parseDate } from "../../common/common";
import { ExpenseCategoryEnum } from "../../models/voucher/ExpenseCategoryEnum";
import apiService from "../../services/apiService";

interface DailyExpenseFormProps {
  expense: DailyExpenseModel;
  index?: number;
  validationErrors?: Record<string, string>;
  onSave: (expense: DailyExpenseModel) => void;
  onCancel?: () => void;
  isEditSidebar?: boolean;
  isAddNewExpense?: boolean;
  categories: any[];
  users: any[];
}

export const DailyExpenseForm: React.FC<DailyExpenseFormProps> = ({
  expense, index = 0, validationErrors = {}, onSave, onCancel, isEditSidebar, isAddNewExpense, categories, users
}) => {
  const { showSuccess, showError } = useToast();
  const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<DailyExpenseModel>({ ...expense });
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);

  const onChangeCategoryType = (type: number) => {
    const categoryName = categories.find(item => item.value == type);
    if (categoryName && categoryName.label == ExpenseCategoryEnum.DailyWagesSalary) {
      setIsEmployee(true);
    } else {
      setIsEmployee(false);
    }
  }

  useEffect(() => {
    setCategoryOptions(categories);
  }, [categories]);

  useEffect(() => {
    if (expense) {
      setFormData(prev => ({
        ...prev,
        ...expense,
        expenseDate: isEditSidebar ? parseDate(expense.expenseDate) : parseDate(new Date()),
      }));
      onChangeCategoryType(expense.expenseCategoryId);
    }
  }, [expense]);

  const onClearError = (fieldKey: string) => {
    setLocalValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[fieldKey];
      return copy;
    });
  };

  const handleChange = (field: keyof DailyExpenseModel, value: any) => {
    const updated = { ...formData, [field]: value };

    setFormData(prev => ({ ...prev, [field]: value }));
    const errorKey = getErrorKey(field);

    const key = getErrorKey(field);
    if (isEditSidebar && localValidationErrors[key])
      onClearError(key);


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
    if (!isEditSidebar && !isAddNewExpense) onSave(updated);
  };

  const getErrorKey = (field: string) => `expense-${index}-${field}`;
  const getErrorMessage = (field: string) => {
    const key = getErrorKey(field);

    if (isEditSidebar || isAddNewExpense) {
      return localValidationErrors[key];
    }

    return validationErrors[key];
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.expenseDate)
      errors[getErrorKey("expenseDate")] = "Expense date required";
    if (!formData.expenseCategoryId)
      errors[getErrorKey("expenseCategoryId")] = "Expense category required";
    if (!formData.amount)
      errors[getErrorKey("amount")] = "Expense amount required";
    if (isEmployee && !formData.employeeId) {
      errors[getErrorKey("employeeId")] = "Employee required";
    }

    setLocalValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
        <legend className="text-sm font-semibold px-2 text-gray-700">
          {formData.dailyExpenseId ? "Edit Expense" : "Add Expense"}
        </legend>
        <div className="flex flex-wrap gap-3 p-1">

          <div className="flex-1 min-w-[140px]">
            <strong className="text-sm">Expense Date <span className="mandatory-asterisk">*</span></strong>
            <Calendar
              value={formData.expenseDate}
              onChange={e => handleChange("expenseDate", e.value ?? null)}
              dateFormat="dd-mm-yy"
              showIcon
              showButtonBar
              className={`w-full mt-1 text-sm ${getErrorMessage("expenseDate") ? "p-invalid" : ""}`}
            />
            {getErrorMessage("expenseDate") && (
              <span className="mandatory-error">{getErrorMessage("expenseDate")}</span>
            )}
          </div>

          <div className="flex-1 min-w-[200px]">
            <strong className="text-sm">Category Type <span className="mandatory-asterisk">*</span></strong>
            <Dropdown
              value={formData.expenseCategoryId}
              options={categoryOptions}
              onChange={(e) => { handleChange("expenseCategoryId", e.value); onChangeCategoryType(e.value); }}
              placeholder="Select Type"
              showClear
              filter
              className={`w-full mt-1 text-sm ${getErrorMessage("expenseCategoryId") ? "p-invalid" : ""}`}
            />
            {getErrorMessage("expenseCategoryId") && (
              <span className="mandatory-error">{getErrorMessage("expenseCategoryId")}</span>
            )}
          </div>

          {isEmployee && (
            <div className="flex-1 min-w-[200px]">
              <strong className="text-sm">Employee <span className="mandatory-asterisk">*</span></strong>
              <Dropdown
                value={formData.employeeId}
                options={users}
                onChange={(e) => { handleChange("employeeId", e.value); }}
                placeholder="Select Type"
                showClear
                filter
                className={`w-full mt-1 text-sm ${getErrorMessage("employeeId") ? "p-invalid" : ""}`}
              />
              {getErrorMessage("employeeId") && (
                <span className="mandatory-error">{getErrorMessage("employeeId")}</span>
              )}
            </div>)}

          <div className={isEditSidebar ? "w-[25%]" : "flex-1 min-w-[100px]"}>
            <strong className="text-sm">Amount <span className="mandatory-asterisk">*</span></strong>
            <InputNumber
              value={formData.amount}
              mode="currency"
              currency="INR"
              locale="en-IN"
              onChange={(e) => handleChange("amount", e.value)}
              className={`w-full mt-1 text-sm ${getErrorMessage("amount") ? "p-invalid" : ""}`}
              inputStyle={{ width: "120px" }}
            />
            {getErrorMessage("amount") && (
              <span className="mandatory-error">{getErrorMessage("amount")}</span>
            )}
          </div>

        </div>

        <div className="flex flex-wrap gap-3 p-1">
          <strong className="text-sm">Remarks</strong>
          <InputTextarea
            rows={2}
            value={formData.remarks}
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
              className="p-button-sm custom-xs" />
          </div>
        )}

      </fieldset>
    </form>
  );
};
