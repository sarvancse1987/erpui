import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";

export const TInputGroupField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputType = "text", // 'text' | 'number'
  leftAddons = [],
  rightAddons = [],
  validate,
  error,
}: any) => {
  const renderAddon = (addon: any, index: number) => {
    switch (addon.type) {
      case "icon":
        return (
          <span key={index} className="p-inputgroup-addon">
            <i className={addon.icon}></i>
          </span>
        );
      case "text":
        return (
          <span key={index} className="p-inputgroup-addon">
            {addon.value}
          </span>
        );
      case "button":
        return (
          <span key={index} className="p-inputgroup-addon">
            <Button {...addon.props} />
          </span>
        );
      case "checkbox":
        return (
          <span key={index} className="p-inputgroup-addon">
            <Checkbox checked={addon.checked} onChange={addon.onChange} />
          </span>
        );
      case "radio":
        return (
          <span key={index} className="p-inputgroup-addon">
            <RadioButton {...addon.props} />
          </span>
        );
      default:
        return null;
    }
  };

  const renderInput = () => {
    const inputProps = {
      value,
      onChange: (e: any) =>
        onChange({
          target: {
            id,
            value: inputType === "number" ? e.value : e.target.value,
          },
        }),
      placeholder,
      className: `p-inputtext-sm ${error ? "p-invalid" : ""}`,
      inputId: id,
    };

    return inputType === "number" ? (
      <InputNumber {...inputProps} />
    ) : (
      <InputText {...inputProps} />
    );
  };

  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="block mb-2">
          {label}
        </label>
      )}
      <div id={id} className="p-inputgroup flex-1" data-validate={validate}>
        {leftAddons.map(renderAddon)}
        {renderInput()}
        {rightAddons.map(renderAddon)}
      </div>
      {/* {error && <small className="p-error block mt-1">{error}</small>} */}
    </div>
  );
};
