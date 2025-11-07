import { Dropdown } from "primereact/dropdown";

export const TDropdownSearchField = ({
  id,
  value,
  onChange,
  label,
  options,
  optionLabel,
  placeholder,
  validate,
  error,
  valueTemplate,
  itemTemplate,
  className = "",
}: any) => {
  const defaultValueTemplate = (option: any, props: any) => {
    if (!option) return <span>{props.placeholder}</span>;
    return (
      <div className="flex align-items-center">
        {/* <img
          src={`https://flagcdn.com/24x18/${option?.code?.toLowerCase()}.png`}
          alt={option.name}
          className="mr-2"
        /> */}
        <span>{option.name}</span>
      </div>
    );
  };

  // Default Dropdown Item Template
  const defaultItemTemplate = (option: any) => {
    return (
      <div className="flex align-items-center">
        {/* <img
          src={`https://flagcdn.com/24x18/${option?.code?.toLowerCase()}.png`}
          alt={option.name}
          className="mr-2"
        /> */}
        <span>{option.name}</span>
      </div>
    );
  };

  return (
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
        className={`p-inputtext-sm w-full md ${
          error ? "p-invalid" : ""
        } ${className}`}
        data-validate={validate}
        filter
        valueTemplate={valueTemplate || defaultValueTemplate}
        itemTemplate={itemTemplate || defaultItemTemplate}
      />
      {/* {error && <small className="p-error block mt-1">{error}</small>} */}
    </div>
  );
};
