import React from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from "primereact/floatlabel";

interface TTextAreaFloatLabelProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  rows?: number;
  cols?: number;
  validate?: boolean;
  error?: string;
}

export const TTextAreaFloatLabel = ({
  id,
  value,
  onChange,
  label,
  rows = 5,
  cols = 30,
  validate,
  error,
}: TTextAreaFloatLabelProps) => (
  <div className="field">
    <FloatLabel>
      <InputTextarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        cols={cols}
        className={`p-inputtext-sm w-full ${error ? "p-invalid" : ""}`}
        data-validate={validate}
      />
      <label htmlFor={id}>{label}</label>
    </FloatLabel>
    {/* {error && <small className="p-error">{error}</small>} */}
  </div>
);
