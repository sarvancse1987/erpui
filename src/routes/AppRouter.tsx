import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/layout";
import { ProtectedRoute } from "./ProtectedRoute";
import MinimalLayout from "../layout/MinimalLayout";
import Unauthorized from "../modules/user/Unauthorized";
import QuotationList from "../modules/quotation/QuotationList";
import DailyExpenseList from "../modules/voucher/DailyExpenseList";
import DailyBookForm from "../modules/voucher/DailyBookList";
import { Home } from "../modules/basics/Home";
import { Products } from "../modules/basics/Products";
import { Contact } from "../modules/basics/Contact";
import About from "../modules/basics/About";
import { Signup } from "../modules/basics/Signup";
import { Services } from "../modules/basics/Services";
import { ResetPassword } from "../modules/basics/ResetPassword";
import { ReportSummary } from "../modules/report/ReportSummary";

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
const RoleMapping = React.lazy(() => import("../modules/user/RoleMapping"));
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
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/product" element={<Products />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/resetpassword" element={<ResetPassword />} />
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
                    <Route path="rolemapping" element={<RoleMapping />} />
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
                    <Route path="quotations" element={<QuotationList />} />
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
                    <Route path="dailyexpense" element={<DailyExpenseList />} />
                    <Route path="dailybook" element={<DailyBookForm />} />
                </Route>

                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route path="quotations">
                    <Route index element={<QuotationList />} />
                </Route>

                 <Route path="reports">
                    <Route index element={<ReportSummary />} />
                </Route>

            </Route>

            {/* Unknown paths redirect */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
