import { InputText } from "primereact/inputtext";

export const TOTPField = ({
  id,
  value,
  onChange,
  validate,
  error,
  length = 6, // Default to 6 if not passed
}: any) => {
  const otpValue = value.split("");

  const handleChange = (e: any, index: number) => {
    // Log the event to check its structure
    console.log("Event:", e);

    // Ensure e.target is defined and contains the value
    if (e.target && e.target.value !== undefined) {
      const updatedOtp = [...otpValue];
      updatedOtp[index] = e.target.value;
      onChange({ value: updatedOtp.join("") });
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && otpValue[index] === "") {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="otp-container flex gap-2 justify-center">
      {Array(length) // Use dynamic length for OTP input fields
        .fill("")
        .map((_, index) => (
          <div key={index} className="field">
            <InputText
              id={`${id}-${index}`}
              maxLength={1}
              value={otpValue[index] || ""}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder="0"
              className={`p-inputtext-sm ${error ? "p-invalid" : ""}`}
              style={{ width: "50px", textAlign: "center" }}
            />
          </div>
        ))}
    </div>
  );
};
    