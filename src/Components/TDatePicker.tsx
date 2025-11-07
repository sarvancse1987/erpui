import { Calendar } from "primereact/calendar";

export const TDatePicker = ({
  id,
  value,
  onChange,
  label,
  validate,
  error,
}: any) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
   
    <Calendar
      id={id}
      value={value}
      onChange={onChange}
      placeholder={label}
      className={`p-inputtext-sm ${error ? "p-invalid" : ""}`}
      data-validate={validate}
      showIcon
    />

    {/* {error && <small className="p-error">{error}</small>} */}
  </div>
);

// block mt-1
