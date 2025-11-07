import { InputNumber } from "primereact/inputnumber";

export const TInputNumberField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  step,
  validate,
  error,
  minFractionDigits,
  maxFractionDigits,
}: any) => (
  <div className="field">
    <label htmlFor={id} className="block mb-2">
      {label}
    </label>
    <InputNumber
      id={id}
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
      step={step}
      className={`p-inputtext-sm ${error ? "p-invalid" : ""}`}
      data-validate={validate ? "true" : "false"}
      {...(typeof minFractionDigits === "number" && { minFractionDigits })}
      {...(typeof maxFractionDigits === "number" && { maxFractionDigits })}
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);
