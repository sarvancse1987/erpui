import { Checkbox } from "primereact/checkbox";

export const TCheckboxGroup = ({
  id,
  value = [],
  onChange,
  label,
  options,
  validate,
  error,
}: any) => {
  const tCheckboxChange = (e: any, optionValue: any) => {
    const newValue = value.includes(optionValue)
      ? value.filter((val: any) => val !== optionValue)
      : [...value, optionValue];

    // ✅ Fix: send just the value array
    onChange(newValue);
  };

  return (
    <div className="field">
      <label className="block mb-2">{label}</label>
      <div className="flex gap-4 flex-wrap" id={id} data-validate={validate}>
        {options.map((option: any) => (
          <div key={option.value} className="flex align-items-center">
            <Checkbox
              inputId={`${id}_${option.value}`}
              name={id}
              value={option.value}
              onChange={() => tCheckboxChange(null, option.value)}
              checked={value?.includes(option.value)}
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
};
