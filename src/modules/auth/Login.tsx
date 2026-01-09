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
import appLogo from "../../Images/erp.png";
import { setCookie, validateForm } from "../../common/common";
import { storage, UserData } from "../../services/storageService";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginModel, setLoginModel] = useState<LoginModel>(new LoginModel());
  const [errors, setErrors] = useState<any>({});
  const { showSuccess, showError } = useToast();
  const { token, setToken } = useAuth();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<String>('');

  const handleSubmit = async (e: React.FormEvent) => {
    const validationErrors = validateForm(loginModel);
    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      const response = await authService.post(
        "/Auth/Login",
        loginModel
      );
      if (response && response.status) {
        localStorage.setItem("authToken", response.token);

        const apiBaseUrl = process.env.REACT_APP_SERVICE_API_BASE_URL?.replace("/api", "") || "";
        const userInfo = response.userInfo;
        const userData: UserData = {
          authToken: userInfo.token,
          companyId: userInfo.companyId,
          locationId: userInfo.locationId,
          userId: userInfo.userId,
          userProfileName: userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : userInfo.firstName,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          userImage: userInfo.userImage ? `${apiBaseUrl}${userInfo.userImage}` : '',
          companyName: userInfo.companyName,
          location: userInfo.location,
          companyLogo: userInfo.path ? `${apiBaseUrl}${userInfo.path}` : '',
          userRole: userInfo.roleName
        };

        storage.setUser(userData);
        storage.setUserModule(response.userModule);
        storage.setUserModuleAction(response.userModuleAction);
        setToken(userInfo.token);
        navigate("/", { replace: true });
      } else {
        const msg = response?.data || "Invalid username or password";
        showError(msg);
        setErrorMsg(msg);
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
              Welcome to <span className="brand">Erp</span>
            </h1>
            <p>
              Sign in to manage your business operations, track reports, and streamline workflows.
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
                label="Email or Username"
                validate={true}
                error={errors.userName}
                placeholder="Email or Username"
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
                type="password"
                placeholder="Password"
              />
            </div>

            <div className="text-center mb-3">
              <a href="/resetpassword" className="forgotLabel">
                Reset Password?
              </a>
            </div>

            <Button
              label="SIGN IN"
              severity="info"
              onClick={handleSubmit}
              className="loginButton"
            />

            {errorMsg && (
              <div className="mandatory-error text-center mt-2">
                {errorMsg}
              </div>
            )}

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
