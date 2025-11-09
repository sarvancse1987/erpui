import React, { useEffect, useState } from "react";
import { redirect, useLocation, useNavigate } from "react-router-dom";
import { LoginModel } from "../../models/authentication/loginModel";
import authService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { TInputField } from "../../components/TInputField";
import { Button } from "primereact/button";
import "../../asset/style/TLogin.css";
import { useAuth } from "../../auth/AuthProvider";
import TetrosoftLofo from "../../Images/Client/tetrosoft_logo.png";
import appLogo from "../../Images/jobsnap_logo.png";
import { setCookie, validateForm } from "../../common/common";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginModel, setLoginModel] = useState<LoginModel>(new LoginModel());
  const [errors, setErrors] = useState<any>({});
  const { showSuccess, showError } = useToast();
  const { token, setToken } = useAuth();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    const validationErrors = validateForm(loginModel);
    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      const response = await authService.post(
        "/Auth/Login",
        loginModel
      );
      if (response && response.status) {
        setCookie("authToken", response.token, 2);
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("token", response.token);
        setToken(response.token);
        navigate("/", { replace: true });
      } else {
        showError(response.message);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginModel((prevState) => ({
      ...prevState,
      [id]: value,
    }));

    setErrors((prevErrors: any) => {
      const newErrors = { ...prevErrors };
      if (value && value !== "") {
        delete newErrors[id];
      }
      return newErrors;
    });
  };

  useEffect(() => {
    if (token) {
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [token, navigate, location.state]);

  return (
    <>
      <div className="MainLoginCard">
        <div className="card loginCard flex">
          {/* Left side */}
          <div className="leftSideContent hidden md:flex flex-column justify-content-center align-items-center md:col-6">
            <img src={appLogo} alt="JobSnap" className="mb-4 LogoApp" />
            <h1 className="WelcomeContent">
              Welcome to <span className="brand">JobSnap</span>
            </h1>
            <p>
              Sign in to your Jobsnap account to manage your job applications,
              update your profile, and stay informed about the latest career
              opportunities.
            </p>
          </div>

          {/* Right side */}
          <div className="rightSideContent flex flex-column justify-content-center">
            {/* Floating Login label */}
            <h3 className="loginTitle">Login</h3>

            <div className="p-fluid mb-3">
              <TInputField
                id="userName"
                value={loginModel.userName}
                onChange={handleChange}
                label="Email or PhoneNo"
                validate={true}
                error={errors.userName}
              />
            </div>

            <div className="p-fluid mb-3">
              <TInputField
                id="password"
                value={loginModel.password}
                onChange={handleChange}
                label="Password"
                validate={true}
                error={errors.password}
              />
            </div>

            <div className="text-center mb-3">
              <a href="#" className="forgotLabel">
                Forgot Password?
              </a>
            </div>

            <Button
              label="SIGN IN"
              severity="info"
              onClick={handleSubmit}
              className="loginButton"
            />

            <div className="poweredBy mt-4 text-center">
              <h5>Powered by</h5>
              <div>
                <img
                  src={TetrosoftLofo}
                  alt="Tetrosoft"
                  className="tetroLogo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
