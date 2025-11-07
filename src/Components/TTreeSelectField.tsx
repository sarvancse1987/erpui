import { TreeSelect } from "primereact/treeselect";

export const TTreeSelectField = ({
  id,
  value,
  onChange,
  label,
  options,
  placeholder,
  validate,
  error,
}: any) => (
  <div className="field">
    <label htmlFor={id} className="block mb-2">
      {label}
    </label>
    <TreeSelect
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder || `Select ${label}`}
      className={`p-inputtext-sm ${error ? "p-invalid" : ""} w-full`}
      data-validate={validate}
    />
    {/* {error && <small className="p-error block mt-1">{error}</small>} */}
  </div>
);
