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
import { TTypedDatatable } from "../../components/TTypedDatatable";
import { customerNameTemplate } from "../../common/common";

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
            const res = await apiService.get("/Supplier/getallsupplier");
            setSuppliers(res.suppliers ?? []);
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

        const seen = new Set<string>();

        newSuppliers.forEach((s, idx) => {
            const name = s.supplierName?.trim();
            const phone = s.phone?.trim();

            if (!name) {
                errors[`supplier-${idx}-supplierName`] = "Supplier name required";
            }
            if (!phone) {
                errors[`supplier-${idx}-phone`] = "Phone required";
            }
            if (!s.contactPerson?.trim()) {
                errors[`supplier-${idx}-contactPerson`] = "Contact person required";
            }

            if (s.email?.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(s.email.trim())) {
                    errors[`supplier-${idx}-email`] = "Valid email required";
                }
            }

            if (s.countryId === 0) s.countryId = null;
            if (s.stateId === 0) s.stateId = null;
            if (s.districtId === 0) s.districtId = null;

            if (name && phone) {
                const key = `${name.toLowerCase()}|${phone}`;
                if (seen.has(key)) {
                    errors[`supplier-${idx}-supplierName`] = "Duplicate supplier";
                    errors[`supplier-${idx}-phone`] = "Duplicate supplier";
                } else {
                    seen.add(key);
                }
            }
        });

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            const response = await apiService.post("/Supplier/bulk", newSuppliers);
            if (response && response.status) {
                await loadSuppliers();
                setNewSuppliers([]);
                showSuccess("Suppliers saved successfully!");
            } else {
                showError(response.error ?? "Suppleir save failed!");
            }
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
            const response = await apiService.put(`/Supplier/${updated.supplierId}`, updated);
            if (response && response.status) {
                await loadSuppliers();
                showSuccess("Supplier updated successfully!");
                setSidebarVisible(false);
            } else {
                showError(response.error ?? "Suppleir update failed!");
            }
        } catch (err) {
            console.error(err);
            showError("Error updating supplier");
        }
    };

    const columns: ColumnMeta<SupplierModel>[] = [
        { field: "supplierId", header: "ID", width: "80px", editable: false, hidden: true },
        {
            field: "supplierName", header: "Name", width: "220px", body: (row: SupplierModel) =>
                customerNameTemplate(row.supplierId, row.supplierName),
        },
        { field: "contactPerson", header: "Contact", width: "180px" },
        { field: "phone", header: "Phone", width: "160px" },
        { field: "gstNumber", header: "GST", width: "120px" },
        { field: "city", header: "City", width: "140px" },
        { field: "districtName", header: "District", width: "150px" },
        { field: "isActive", header: "Active", width: "100px", body: (row) => (row.isActive ? "✅" : "❌"), editable: false, hidden: true },
    ];

    if (loading) return <p>Loading suppliers...</p>;

    const handleDeleteSuppliers = async (rows: SupplierModel[]) => {
        try {
            const ids = rows.map(r => r.supplierId);

            const response = await apiService.post("/Supplier/bulk-delete", ids);
            if (response && response.status) {
                showSuccess("Supplier(s) deleted successfully!");
                await loadSuppliers();
            } else {
                showError(response.error ?? "Suppleir delete failed!");
            }
        } catch (err) {
            console.error(err);
            showError("Error deleting suppliers");
        }
    };


    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">🏢 Supplier Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-building" />
                        <span>Suppliers</span>
                    </div>
                }>
                    <TTypeDatatable<SupplierModel>
                        data={suppliers}
                        columns={columns}
                        primaryKey="supplierId"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        onDelete={handleDeleteSuppliers}
                        isNew={false}
                        isSave={false}
                        sortableColumns={['supplierName', 'phone', 'city']}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="flex gap-2 mb-4">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewSupplier} className="p-button-info custom-xs" />
                        {newSuppliers.length > 0 && (<Button label="Save" icon="pi pi-save" onClick={handleSaveSuppliers} className="p-button-sm custom-xs" />)}
                    </div>

                    {newSuppliers.length === 0 ? (
                        <p className="text-gray-500">Click “Add New” to create.</p>
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
                style={{ width: '75rem', height: '100%' }}
                showCloseIcon={true}
                header="Edit Supplier"
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
