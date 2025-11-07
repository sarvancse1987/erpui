import { InputMask } from "primereact/inputmask";

export const TPhoneNumberField = ({
  id,
  value,
  onChange,
  label,
  validate,
  error,
}: any) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    <InputMask
      id={id}
      mask="(+91) 99999 99999"
      value={value}
      onChange={onChange}
      placeholder="(+91) 99999 99999"
      className={`p-inputtext-sm ${error ? "p-invalid" : ""}`}
      data-validate={validate}
    />
    {/* {error && <small className="p-error">{error}</small>} */}
  </div>
);
