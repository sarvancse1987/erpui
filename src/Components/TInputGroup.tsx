import React from "react";
import { TDropdownField } from "./TDropdownField";
import { TInputField } from "./TInputField";

interface PersonNameInputGroupProps {
  idPrefix: string;
  label: string;
  dropdownValue: any;
  dropdownOptions: any[];
  dropdownOnChange: (e: { value: any }) => void;
  inputValue: string;
  inputOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorDropdown?: string;
  errorInput?: string;
}

const PersonNameInputGroup: React.FC<PersonNameInputGroupProps> = ({
  idPrefix,
  label,
  dropdownValue,
  dropdownOptions,
  dropdownOnChange,
  inputValue,
  inputOnChange,
  errorDropdown,
  errorInput,
}) => {
  return (
    <div className="form-group" style={{ marginBottom: "1rem" }}>
      <label>
        {label} <span className="requiredLable">*</span>
      </label>
      <div className="input-group" style={{ display: "flex" }}>
        <div style={{ flex: "0 0 27%", maxWidth: "27%", marginRight: "0.5rem" }}>
          <TDropdownField
            id={`${idPrefix}-salutation`}
            value={dropdownValue}
            options={dropdownOptions}
            optionLabel="name"
            onChange={dropdownOnChange}
            validate={true}
            error={errorDropdown}
          />
        </div>

        <div style={{ flex: "0 0 68%", maxWidth: "68%" }}>
          <TInputField
            id={`${idPrefix}-name`}
            value={inputValue}
            onChange={inputOnChange}
            label={label}
            validate={true}
            error={errorInput}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonNameInputGroup;
