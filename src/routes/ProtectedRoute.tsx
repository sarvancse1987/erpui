import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { storage } from "../services/storageService";
import { resolveRequiredModule } from "./PermissionResolver";


interface Props {
    children: JSX.Element;
}

export const ProtectedRoute = ({ children }: Props) => {
    const token = localStorage.getItem("authToken");
    const location = useLocation();
    const isUnauthorizedPage = location.pathname === "/unauthorized";
    const isRoleMappingPage = location.pathname === "/users/rolemapping";
    const isAdmin = storage.getRole() === "Admin";
    // 1️⃣ Authentication
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2️⃣ Authorization
    if (!(isUnauthorizedPage || (isAdmin && isRoleMappingPage))) {
        const requiredModule = resolveRequiredModule(location.pathname);

        if (requiredModule && !storage.hasModule(requiredModule)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};
