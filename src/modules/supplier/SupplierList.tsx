import React, { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { SupplierForm } from "./SupplierForm";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypeDatatable } from "../../components/TTypeDatatable";

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
    const [newSuppliers, setNewSuppliers] = useState<SupplierModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierModel | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { showSuccess, showError } = useToast();

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const res = await apiService.get("/Supplier");
            setSuppliers(res ?? []);
        } catch (err) {
            console.error("Error loading suppliers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const createEmptySupplier = (): SupplierModel => ({
        supplierId: 0,
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        gstNumber: "",
        address: "",
        city: "",
        countryId: 0,
        countryName: "",
        stateId: 0,
        stateName: "",
        districtId: 0,
        districtName: "",
        postalCode: "",
        isActive: true,
        createdAt: new Date().toISOString(),
    });

    const addNewSupplier = () => setNewSuppliers((prev) => [createEmptySupplier(), ...prev]);

    const handleUpdateNewSupplier = (index: number, updated: SupplierModel) => {
        setNewSuppliers((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };

    const handleRemoveNewSupplier = (index: number) => {
        setNewSuppliers((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveSuppliers = async () => {
        const errors: Record<string, string> = {};

        newSuppliers.forEach((s, idx) => {
            if (!s.supplierName.trim()) errors[`supplier-${idx}-supplierName`] = "Supplier name required";
            if (!s.phone.trim()) errors[`supplier-${idx}-phone`] = "Phone required";
            if (!s.contactPerson.trim()) errors[`supplier-${idx}-contactPerson`] = "Contact Person required";
            if (s.email?.trim()) {
                if (s.email?.trim() != undefined && s.email?.trim() !== "") {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(s.email.trim())) {
                        errors[`supplier-${idx}-email`] = "Valid email required";
                    }
                }
            }

            if (s.countryId === 0) {
                s.countryId = null;
            }
            if (s.stateId === 0) {
                s.stateId = null;
            }
            if (s.districtId === 0) {
                s.districtId = null;
            }
        });

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await apiService.post("/Supplier/bulk", newSuppliers);
            await loadSuppliers();
            setNewSuppliers([]);
            showSuccess("Suppliers saved successfully!");
        } catch (err) {
            console.error(err);
            showError("Error saving suppliers");
        }
    };

    const handleOpenEdit = (supplier: SupplierModel) => {
        setSelectedSupplier({ ...supplier });
        setSidebarVisible(true);
    };

    const handleUpdateSupplier = async (updated: SupplierModel) => {
        try {
            await apiService.put(`/Supplier/${updated.supplierId}`, updated);
            await loadSuppliers();
            showSuccess("Supplier updated successfully!");
            setSidebarVisible(false);
        } catch (err) {
            console.error(err);
            showError("Error updating supplier");
        }
    };

    const columns: ColumnMeta<SupplierModel>[] = [
        { field: "supplierId", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "supplierName", header: "Name", width: "220px" },
        { field: "contactPerson", header: "Contact", width: "180px" },
        { field: "phone", header: "Phone", width: "160px" },
        { field: "gstNumber", header: "GST", width: "140px" },
        { field: "city", header: "City", width: "140px" },
        { field: "stateName", header: "State", width: "220px" },
        { field: "isActive", header: "Active", width: "100px", body: (row) => (row.isActive ? "✅" : "❌"), editable: false, hidden: true },
    ];

    if (loading) return <p>Loading suppliers...</p>;

    const handleDeleteSuppliers = async (rows: SupplierModel[]) => {
        try {
            // Extract IDs only
            const ids = rows.map(r => r.supplierId);

            // Call API (bulk delete)
            await apiService.post("/Supplier/bulk-delete", ids);

            showSuccess("Supplier(s) deleted successfully!");

            // Reload table
            await loadSuppliers();
        } catch (err) {
            console.error(err);
            showError("Error deleting suppliers");
        }
    };


    return (
        <div className="p-3 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">🏢 Supplier Management</h2>

            <TabView>
                <TabPanel header="Suppliers">
                    <TTypeDatatable<SupplierModel>
                        data={suppliers}
                        columns={columns}
                        primaryKey="supplierId"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        onDelete={handleDeleteSuppliers}
                        isNew={true}
                        isSave={true}
                    />
                </TabPanel>

                <TabPanel header="Add / Edit Suppliers">
                    <div className="flex gap-2 mb-4">
                        <Button label="Add New" icon="pi pi-plus" outlined severity="success" onClick={addNewSupplier} />
                        <Button label="Save All" icon="pi pi-save" onClick={handleSaveSuppliers} disabled={!newSuppliers.length} />
                    </div>

                    {newSuppliers.length === 0 ? (
                        <p className="text-gray-500">No new suppliers. Click “Add New” to create.</p>
                    ) : (
                        newSuppliers.map((s, idx) => (
                            <SupplierForm
                                key={idx}
                                supplier={s}
                                index={idx}
                                onSave={(updated) => handleUpdateNewSupplier(idx, updated)}
                                onCancel={() => handleRemoveNewSupplier(idx)}
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
                header="Edit Supplier"
                style={{ width: "60rem" }}
            >
                {selectedSupplier ? (
                    <SupplierForm
                        supplier={selectedSupplier}
                        onSave={handleUpdateSupplier}
                        onCancel={() => setSidebarVisible(false)}
                        isEditSidebar={true}
                    />
                ) : (
                    <p className="p-4 text-gray-500 text-center">Select a supplier to edit.</p>
                )}
            </Sidebar>
        </div>
    );
}
