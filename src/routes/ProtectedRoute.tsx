import { JSX } from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem("authToken");
    return token ? children : <Navigate to="/login" replace />;
};
