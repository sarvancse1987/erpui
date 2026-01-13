import { useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { RadioButton } from "primereact/radiobutton";
import { InputMask } from "primereact/inputmask";
import apiService from "../../services/apiService";

export const ResetPassword = () => {
  const toast = useRef<Toast>(null);

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async () => {
    setSubmitted(true);
    if (method === "email") {
      if (!email || !isValidEmail(email)) return;
    }
    if (method === "phone" && !phone) return;

    setOtpLoading(true);
    const response = await apiService.post("/users/send-otp", { email, phone });
    if (response && response.status) {
      setOtpSent(true);
      setSubmitted(false);
      setOtpLoading(false);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: response.message || "OTP sent successfully"
      });
    } else {
      setOtpLoading(false);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: response.error ?? "OTP sent failed"
      });
    }
  };

  /* ---------------- RESET PASSWORD ---------------- */
  const resetPassword = async () => {
    setSubmitted(true);

    if (!otp || !password || !confirmPassword) return;
    if (password !== confirmPassword) return;

    const response = await apiService.post("/users/confirm-reset-password", { email, phone, otp, confirmPassword });
    if (response && response.status) {

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Password reset successfully"
      });

      // Clear
      setEmail("");
      setPhone("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setOtpSent(false);
      setSubmitted(false);
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: response.error ?? "Password reset failed"
      });
    }
  };

  return (
    <div className="flex justify-content-center align-items-center vh-100 p-3">
      <Toast ref={toast} />

      <Card title="Reset Password" className="w-full md:w-4">
        {/* METHOD */}
        <div className="flex gap-4 mb-4">
          <div className="flex align-items-center">
            <RadioButton
              inputId="email"
              checked={method === "email"}
              onChange={() => setMethod("email")}
            />
            <label htmlFor="email" className="ml-2">Email</label>
          </div>

          <div className="flex align-items-center">
            <RadioButton
              inputId="phone"
              checked={method === "phone"}
              onChange={() => setMethod("phone")}
            />
            <label htmlFor="phone" className="ml-2">Phone</label>
          </div>
        </div>

        {/* EMAIL / PHONE */}
        {method === "email" ? (
          <div className="field mb-3">
            <label>Email <span className="star">*</span></label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${submitted && !email ? "p-invalid" : ""}`}
              placeholder="Enter registered email"
            />
            {submitted && !email && (
              <small className="p-error">Email is required</small>
            )}
            {submitted && email && !isValidEmail(email) && <small className="p-error">Invalid email format</small>}
          </div>
        ) : (
          <div className="field mb-3">
            <label>Phone <span className="star">*</span></label>
            <InputMask
              mask="+99-9999999999"
              value={phone}
              onChange={(e) => setPhone(e.value || "")}
              className={`w-full ${submitted && !phone ? "p-invalid" : ""}`}
              placeholder="+91-9999999999"
            />
            {submitted && !phone && (
              <small className="p-error">Phone number is required</small>
            )}
          </div>
        )}

        {/* SEND OTP */}
        {!otpSent && (
          <Button
            label="Send OTP"
            icon="pi pi-send"
            className="w-full mb-3"
            onClick={sendOtp}
            loading={otpLoading}
            loadingIcon="pi pi-spin pi-spinner"
          />
        )}

        {/* OTP + PASSWORD */}
        {otpSent && (
          <>
            <div className="field mb-3">
              <label>OTP <span className="star">*</span></label>
              <InputText
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full ${submitted && !otp ? "p-invalid" : ""}`}
              />
              {submitted && !otp && (
                <small className="p-error">OTP is required</small>
              )}
            </div>

            <div className="field mb-3">
              <label>New Password <span className="star">*</span></label>
              <Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                feedback={false}
                inputClassName="w-full p-inputtext"
                className={`w-full ${submitted && !password ? "p-invalid" : ""}`}
              />
              {submitted && !password && (
                <small className="p-error">Password is required</small>
              )}
            </div>

            <div className="field mb-3">
              <label>Confirm Password <span className="star">*</span></label>
              <Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                toggleMask
                feedback={false}
                inputClassName="w-full p-inputtext"
                className={`w-full ${submitted &&
                  (!confirmPassword || password !== confirmPassword)
                  ? "p-invalid"
                  : ""
                  }`}
              />
              {submitted && !confirmPassword && (
                <small className="p-error">Confirm password is required</small>
              )}
              {submitted &&
                confirmPassword &&
                password !== confirmPassword && (
                  <small className="p-error">Passwords do not match</small>
                )}
            </div>

            <Button
              label="Reset Password"
              icon="pi pi-check"
              className="w-full"
              onClick={resetPassword}
            />
          </>
        )}
      </Card>
    </div>
  );
};
