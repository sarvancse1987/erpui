import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
      <div className="surface-card p-6 shadow-2 border-round text-center w-full sm:w-30rem">
        <i
          className="pi pi-lock text-6xl text-red-500 mb-4"
          style={{ display: "block" }}
        />

        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>

        <p className="text-600 mb-4">
          You do not have permission to access this page.
        </p>

        <div className="flex justify-content-center gap-3">
          <Button
            label="Go to Dashboard"
            icon="pi pi-home"
            onClick={() => navigate("/")}
          />

          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="secondary"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
