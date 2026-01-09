import { useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";

export const ResetPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const toast = useRef<Toast>(null);

  // Example puzzle
  const puzzle = {
    question: "What is 3 + 5?",
    answer: "8",
  };

  const handleSubmit = () => {
    if (!emailOrPhone || !password || !confirmPassword || !puzzleAnswer) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "All fields are required",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: "Password Mismatch",
        detail: "Password and Confirm Password do not match",
      });
      return;
    }

    if (puzzleAnswer !== puzzle.answer) {
      toast.current?.show({
        severity: "error",
        summary: "Puzzle Incorrect",
        detail: "Please solve the puzzle correctly",
      });
      return;
    }

    // Call API to update password
    console.log({
      emailOrPhone,
      password,
    });

    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Password reset successfully!",
    });

    // Reset fields
    setEmailOrPhone("");
    setPassword("");
    setConfirmPassword("");
    setPuzzleAnswer("");
  };

  return (
    <div className="flex justify-content-center align-items-center vh-100 p-2">
      <Toast ref={toast} />
      <Card title="Reset Password" className="w-full md:w-5">
        {/* Email or Phone */}
        <div className="field mb-3">
          <label htmlFor="emailOrPhone">Email or Phone Number</label>
          <InputText
            id="emailOrPhone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Enter your email or phone"
            className="w-full"
          />
        </div>

        {/* New Password */}
        <div className="field mb-3">
          <label htmlFor="password">New Password</label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            feedback={true}
            placeholder="Enter new password"
            className="w-full"
          />
        </div>

        {/* Confirm Password */}
        <div className="field mb-3">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <Password
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            toggleMask
            placeholder="Re-enter password"
            className="w-full"
          />
        </div>

        {/* Simple Puzzle */}
        <div className="field mb-3">
          <label htmlFor="puzzle">Puzzle: {puzzle.question}</label>
          <InputText
            id="puzzle"
            value={puzzleAnswer}
            onChange={(e) => setPuzzleAnswer(e.target.value)}
            placeholder="Your answer"
            className="w-full"
          />
        </div>

        <Button
          label="Reset Password"
          icon="pi pi-check"
          className="w-full"
          onClick={handleSubmit}
        />
      </Card>
    </div>
  );
};
