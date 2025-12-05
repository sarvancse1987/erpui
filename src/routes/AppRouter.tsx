import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/layout";
import { ProtectedRoute } from "./ProtectedRoute";
import MinimalLayout from "../layout/MinimalLayout";
import Category from "../modules/products/Category";
import Group from "../modules/products/Group";
import Brand from "../modules/products/BrandPage";
import Unit from "../modules/products/Unit";
import SupplierList from "../modules/supplier/SupplierList";
import PurchaseList from "../modules/purchase/PurchaseList";
import CustomerList from "../modules/customer/CustomerList";
import Role from "../modules/user/Role";
import UserType from "../modules/user/UserType";
import LocationList from "../modules/companies/LocationList";
import { MyProfile } from "../modules/user/MyProfile";
import { ChangePassword } from "../modules/user/ChangePassword";
import InventoryForm from "../modules/inventory/InventoryForm";

const Dashboard = React.lazy(() => import("../modules/dashboard/Dashboard"));
const ProductList = React.lazy(() => import("../modules/products/ProductList"));
const SalesList = React.lazy(() => import("../modules/sales/SalesList"));
const InventoryList = React.lazy(() => import("../modules/inventory/InventoryList"));
const InventoryAdjust = React.lazy(() => import("../modules/inventory/InventoryAdjust"));
const UserList = React.lazy(() => import("../modules/user/UserList"));
const Login = React.lazy(() => import("../modules/auth/Login"));
const CompanyList = React.lazy(() => import("../modules/companies/CompanyList"));

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

                {/* User Module */}
                <Route path="users">
                    <Route index element={<UserList />} />
                    <Route path="roles" element={<Role />} />
                    <Route path="usertypes" element={<UserType />} />
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
                    <Route index element={<InventoryForm />} />
                    <Route path="adjust" element={<InventoryAdjust />} />
                </Route>

                {/* Inventory Module */}
                <Route path="companies">
                    <Route index element={<CompanyList />} />
                    <Route path="locations" element={<LocationList />} />
                </Route>

                {/* Settings Module */}
                <Route path="settings">
                    <Route path="users" element={<UserList />} />
                </Route>

                <Route path="myprofile" element={<MyProfile />} />
                <Route path="changepassword" element={<ChangePassword />} />

            </Route>

            {/* Unknown paths redirect */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
