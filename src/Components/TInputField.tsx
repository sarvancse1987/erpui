import { InputText } from "primereact/inputtext";

export const TInputField = ({
  id,
  value,
  onChange,
  label,
  placeholder,
  type = "text",
  validate,
  error,
  disabled = false,
  style,
}: any) => (
  <div className="field" style={{ marginBottom: "0px", ...style }}>
    <label htmlFor={id}>
      {label} {validate && <span className="star">*</span>}{" "}
    </label>
    <InputText
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`p-inputtext-sm ${error ? "p-invalid" : ""}`}
      data-validate={validate}
      disabled={disabled}
      style={{ width: "100%" }}
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);
