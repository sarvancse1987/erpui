import { InputText } from "primereact/inputtext";

export const TInputField = ({
  id,
  value,
  onChange,
  label,
  type = "text",
  validate,
  error,
  disabled,
}: any) => (
  <div className="field"style={{ marginBottom: "0px" }}>
    <label htmlFor={id}>{label}</label>
    <InputText
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={label}
      className={`p-inputtext-sm ${error ? "p-invalid" : ""}`}
      data-validate={validate}
      disabled = {disabled}
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

// block mt-1
