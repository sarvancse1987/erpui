import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/layout";
import { ProtectedRoute } from "./ProtectedRoute";
import MinimalLayout from "../layout/MinimalLayout";

const Dashboard = React.lazy(() => import("../modules/dashboard/Dashboard"));
const ProductList = React.lazy(() => import("../modules/products/ProductList"));
const SalesList = React.lazy(() => import("../modules/sales/SalesList"));
const UserList = React.lazy(() => import("../modules/user/UserList"));
const Login = React.lazy(() => import("../modules/auth/Login"));
const CompanyList = React.lazy(() => import("../modules/companies/CompanyList"));

const Category = React.lazy(() => import("../modules/products/Category"));
const Group = React.lazy(() => import("../modules/products/Group"));
const Brand = React.lazy(() => import("../modules/products/BrandPage"));
const Unit = React.lazy(() => import("../modules/products/Unit"));
const CustomerList = React.lazy(() => import("../modules/customer/CustomerList"));
const SupplierList = React.lazy(() => import("../modules/supplier/SupplierList"));
const PurchaseList = React.lazy(() => import("../modules/purchase/PurchaseList"));
const Role = React.lazy(() => import("../modules/user/Role"));
const UserType = React.lazy(() => import("../modules/user/UserType"));
const MyProfile = React.lazy(() => import("../modules/user/MyProfile"));
const ChangePassword = React.lazy(() => import("../modules/user/ChangePassword"));
const LocationList = React.lazy(() => import("../modules/companies/LocationList"));
const InventoryForm = React.lazy(() => import("../modules/inventory/InventoryForm"));
const CustomerLedgerList = React.lazy(() => import("../modules/Ledger/CustomerLedgerList"));
const VoucherList = React.lazy(() => import("../modules/voucher/VoucherList"));
const ShipmentList = React.lazy(() => import("../modules/sales/ShipmentList"));

const DemoForm = React.lazy(() => import("../modules/demo/DemoForm"));

export default function AppRouter() {
    return (
        <Routes>

            {/* Login Route */}
            <Route element={<MinimalLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/demo" element={<DemoForm />} />
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
                    <Route path="shipments" element={<ShipmentList />} />
                </Route>

                {/* Inventory Module */}
                <Route path="inventory">
                    <Route index element={<InventoryForm />} />
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

                <Route path="ledger">
                    <Route index element={<CustomerLedgerList />} />
                    <Route path="voucher" element={<VoucherList />} />
                </Route>



            </Route>

            {/* Unknown paths redirect */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
