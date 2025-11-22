import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/layout";
import { ProtectedRoute } from "./ProtectedRoute";
import MinimalLayout from "../layout/MinimalLayout";
import Category from "../modules/products/pages/Category";
import Group from "../modules/products/pages/Group";
import Brand from "../modules/products/pages/BrandPage";
import Unit from "../modules/products/pages/Unit";
import SupplierList from "../modules/supplier/SupplierList";
import PurchaseList from "../modules/purchase/PurchaseList";
import CustomerList from "../modules/customer/CustomerList";

const Dashboard = React.lazy(() => import("../modules/dashboard/Dashboard"));
const ProductList = React.lazy(() => import("../modules/products/pages/ProductList"));
const SalesList = React.lazy(() => import("../modules/sales/pages/SalesList"));
const InventoryList = React.lazy(() => import("../modules/inventory/pages/InventoryList"));
const InventoryAdjust = React.lazy(() => import("../modules/inventory/pages/InventoryAdjust"));
const UserList = React.lazy(() => import("../modules/settings/pages/UserList"));
const RoleList = React.lazy(() => import("../modules/settings/pages/RoleList"));
const Login = React.lazy(() => import("../modules/auth/Login"));

export default function AppRouter() {
    return (
        <Routes>

            {/* Login Route */}
            <Route element={<MinimalLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected ERP Layout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                {/* Dashboard */}
                <Route index element={<Dashboard />} />

                {/* Product Module */}
                <Route path="products">
                    <Route index element={<ProductList />} />
                    <Route path="category" element={<Category />} />
                    <Route path="group" element={<Group />} />
                    <Route path="brand" element={<Brand />} />
                    <Route path="unit" element={<Unit />} />
                </Route>

                {/* Supplier Module */}
                <Route path="suppliers">
                    <Route index element={<SupplierList />} />
                </Route>

                 {/* Supplier Module */}
                <Route path="customers">
                    <Route index element={<CustomerList />} />
                </Route>

                {/* Inventory Module */}
                <Route path="purchase">
                    <Route index element={<PurchaseList />} />
                </Route>

                {/* Sales Module */}
                <Route path="sales">
                    <Route index element={<SalesList />} />
                </Route>

                {/* Inventory Module */}
                <Route path="inventory">
                    <Route index element={<InventoryList />} />
                    <Route path="adjust" element={<InventoryAdjust />} />
                </Route>

                {/* Settings Module */}
                <Route path="settings">
                    <Route path="users" element={<UserList />} />
                    <Route path="roles" element={<RoleList />} />
                </Route>
            </Route>

            {/* Unknown paths redirect */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
