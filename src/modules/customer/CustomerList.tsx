import React, { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { CustomerForm } from "./CustomerForm";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { CustomerModel } from "../../models/customer/CustomerModel";
import { TTypedDatatable } from "../../components/TTypedDatatable";

export default function CustomerList() {
    const [customers, setCustomers] = useState<CustomerModel[]>([]);
    const [newCustomers, setNewCustomers] = useState<CustomerModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerModel | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { showSuccess, showError } = useToast();

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const res = await apiService.get("/Customer/details");
            setCustomers(res.customers ?? []);
        } catch (err) {
            console.error("Error loading customers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const createEmptyCustomer = (): CustomerModel => ({
        customerId: 0,
        customerName: "",
        phone: "",
        email: "",
        gstNumber: "",
        address: "",
        city: "",
        postalCode: null,
        countryId: 0,
        stateId: 0,
        districtId: 0,
        currentEligibility: null
    });

    const addNewCustomer = () => {
        setNewCustomers((prev) => [createEmptyCustomer(), ...prev]);
    };

    const handleUpdateNewCustomer = (index: number, updated: CustomerModel) => {
        setNewCustomers((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };

    const handleRemoveNewCustomer = (index: number) => {
        setNewCustomers((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveCustomers = async () => {
        const errors: Record<string, string> = {};

        newCustomers.forEach((c, idx) => {
            if (!c.customerName.trim())
                errors[`customer-${idx}-customerName`] = "Customer name required";

            if (c.email?.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(c.email.trim())) {
                    errors[`customer-${idx}-email`] = "Valid email required";
                }
            }

            if (c.countryId === 0) c.countryId = null;
            if (c.stateId === 0) c.stateId = null;
            if (c.districtId === 0) c.districtId = null;
        });

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await apiService.post("/Customer/bulk", newCustomers);
            await loadCustomers();
            setNewCustomers([]);
            showSuccess("Customers saved successfully!");
        } catch (err) {
            console.error(err);
            showError("Error saving customers");
        }
    };

    const handleOpenEdit = (customer: CustomerModel) => {
        setSelectedCustomer({ ...customer });
        setSidebarVisible(true);
    };

    const handleUpdateCustomer = async (updated: CustomerModel) => {
        try {
            await apiService.put(`/Customer/${updated.customerId}`, updated);
            await loadCustomers();
            showSuccess("Customer updated successfully!");
            setSidebarVisible(false);
        } catch (err) {
            console.error(err);
            showError("Error updating customer");
        }
    };

    const handleDeleteCustomers = async (rows: CustomerModel[]) => {
        try {
            const ids = rows.map((r) => r.customerId);
            await apiService.post("/Customer/bulk-delete", ids);
            showSuccess("Customer(s) deleted successfully!");
            await loadCustomers();
        } catch (err) {
            console.error(err);
            showError("Error deleting customers");
        }
    };

    const columns: ColumnMeta<CustomerModel>[] = [
        { field: "customerId", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "customerName", header: "Name", width: "220px", required: true },
        { field: "phone", header: "Phone", width: "140px" },
        { field: "email", header: "Email", width: "170px" },
        { field: "gstNumber", header: "GST", width: "130px" },
        { field: "city", header: "City", width: "110px" },
        { field: "districtName", header: "District", width: "150px" },
    ];

    if (loading) return <p>Loading customers...</p>;

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">👤 Customer Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-users" />
                        <span>Customers</span>
                    </div>
                }>
                    <TTypeDatatable<CustomerModel>
                        data={customers}
                        columns={columns}
                        primaryKey="customerId"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        onDelete={handleDeleteCustomers}
                        isNew={false}
                        isSave={false}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="flex gap-2 mb-4">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewCustomer} className="p-button-info custom-xs" />
                        {newCustomers.length > 0 && (<Button label="Save" icon="pi pi-save" onClick={handleSaveCustomers} className="p-button-sm custom-xs" />)}
                    </div>

                    {newCustomers.length === 0 ? (
                        <p className="text-gray-500">No new customers. Click “Add” to create.</p>
                    ) : (
                        newCustomers.map((c, idx) => (
                            <CustomerForm
                                key={idx}
                                customer={c}
                                index={idx}
                                onSave={(updated) => handleUpdateNewCustomer(idx, updated)}
                                onCancel={() => handleRemoveNewCustomer(idx)}
                                validationErrors={validationErrors}
                                isEditSidebar={false}
                            />
                        ))
                    )}
                </TabPanel>
            </TabView>

            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                style={{ width: '75rem', height: '100%' }}
                showCloseIcon={true}
                header="Edit Customer"
            >
                {selectedCustomer ? (
                    <CustomerForm
                        customer={selectedCustomer}
                        onSave={handleUpdateCustomer}
                        onCancel={() => setSidebarVisible(false)}
                        isEditSidebar={true}
                    />
                ) : (
                    <p className="p-4 text-gray-500 text-center">Select a customer to edit.</p>
                )}
            </Sidebar>
        </div>
    );
}
