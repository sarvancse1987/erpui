import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { removeCookie } from "../../common/common";
import { useAuth } from "../../auth/AuthProvider";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();
  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
      <div className="surface-card p-6 shadow-2 border-round text-center w-full sm:w-30rem">
        <i
          className="pi pi-lock text-6xl text-red-500 mb-4"
          style={{ display: "block" }}
        />

        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>

        <p className="text-600 mb-4">
          You do not have access. Please request approval.
        </p>

        <div className="flex justify-content-center gap-3">
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="secondary"
            onClick={() => {
              localStorage.clear();
              setToken("");
              removeCookie("authToken")
              localStorage.removeItem("user");
              localStorage.removeItem("authToken");
              localStorage.removeItem("userModule");
              localStorage.removeItem("userModuleAction");
              navigate("/login");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
