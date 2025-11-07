import { AutoComplete } from "primereact/autocomplete";

export const TAutoCompleteField = ({
  id,
  label,
  value,
  onChange,
  suggestions = [],
  completeMethod,
  placeholder = "Type to search...",
  dropdown = true,
  validate = false,
  error = "",
}: any) => {
  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="block mb-2">
          {label}
        </label>
      )}
      <AutoComplete
        inputId={id}
        id={id}
        value={value}
        suggestions={suggestions}
        completeMethod={completeMethod}
        onChange={(e) => onChange({ target: { id, value: e.value } })}
        placeholder={placeholder}
        dropdown={dropdown}
        className={error ? "p-invalid w-full" : "w-full"}
        data-validate={validate}
      />
      {error && <small className="p-error block mt-1">{error}</small>}
    </div>
  );
};
