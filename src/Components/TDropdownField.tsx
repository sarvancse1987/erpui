import { Dropdown } from "primereact/dropdown";

export const TDropdownField = ({
  id,
  value,
  onChange,
  label,
  options,
  optionLabel,
  placeholder,
  validate,
  error,
}: any) => (
  <div className="field">
    <label htmlFor={id} className="block mb-2">
      {label}
    </label>
    <Dropdown
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      optionLabel={optionLabel}
      placeholder={placeholder || `Select ${label}`}
      className={`p-inputtext-sm ${error ? "p-invalid" : ""}`}
      data-validate={validate}
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);
