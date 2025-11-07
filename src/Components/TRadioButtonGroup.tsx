import { RadioButton } from "primereact/radiobutton";

export const TRadioButtonGroup = ({
  id,
  value,
  onChange,
  label,
  options,
  validate,
  error,
  name,
}: any) => (
  <div className="field">
    <label className="block mb-2">{label}</label>
    <div
      className={`flex gap-4 flex-wrap ${error ? "invalid" : ""}`}
      id={id}
      data-validate={validate}
    >
      {options.map((option: any) => (
        <div key={option.value} className="flex align-items-center">
          <RadioButton
            inputId={`${id}_${option.value}`}
            name={name || id}
            value={option.value}
            onChange={(e) => onChange({ target: { id, value: e.value } })}
            checked={value === option.value}
          />
          <label htmlFor={`${id}_${option.value}`} className="ml-2">
            {option.name}
          </label>
        </div>
      ))}
    </div>
    {error && <small className="p-error block mt-1">{error}</small>}
  </div>
);
