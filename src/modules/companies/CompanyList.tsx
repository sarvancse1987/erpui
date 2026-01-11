import React, { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { CompanyForm } from "./CompanyForm";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { CompanyModel } from "../../models/companies/CompanyModel";
import { storage } from "../../services/storageService";

export default function CompanyList() {
    const [companies, setCompanies] = useState<CompanyModel[]>([]);
    const [newCompanies, setNewCompanies] = useState<CompanyModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedCompany, setSelectedCompany] = useState<CompanyModel | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { showSuccess, showError } = useToast();
    const user = storage.getUser();

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const res = await apiService.get(`/Company/getcompany/${Number(user?.companyId)}`);
            setCompanies(res.companies ?? []);
        } catch (err) {
            console.error("Error loading companies:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    const createEmptyCompany = (): CompanyModel => ({
        id: 0,
        name: "",
        address: "",
        logo: "",
        path: "",
        city: "",
        stateId: null,
        countryId: null,
        districtId: null,
        zipcode: "",
        phone: "",
        email: "",
        website: "",
        gstNumber: "",
        bankName: "",
        branchName: "",
        accountType: "",
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        upiId: "",
        signature: "",
        companyId: 0,
        isActive: true
    });

    const addNewCompany = () => setNewCompanies((prev) => [createEmptyCompany(), ...prev]);

    const handleUpdateNewCompany = (index: number, updated: CompanyModel) => {
        setNewCompanies((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };

    const handleRemoveNewCompany = (index: number) => {
        setNewCompanies((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveCompanies = async () => {
        const errors: Record<string, string> = {};

        // ================= BASIC VALIDATION =================
        newCompanies.forEach((c, idx) => {
            c.companyId = Number(user?.companyId);

            if (!c.name?.trim()) {
                errors[`company-${idx}-name`] = "Company name required";
            }

            if (!c.phone?.trim()) {
                errors[`company-${idx}-phone`] = "Phone required";
            }

            if (c.email?.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(c.email.trim())) {
                    errors[`company-${idx}-email`] = "Valid email required";
                }
            }

            // Normalize IDs
            if (c.countryId === 0) c.countryId = null;
            if (c.stateId === 0) c.stateId = null;
            if (c.districtId === 0) c.districtId = null;
        });

        // ================= DUPLICATE COMPANY NAME CHECK =================
        newCompanies.forEach((c, idx) => {
            const name = c.name?.trim().toLowerCase();
            if (!name) return;

            const duplicate = newCompanies.some(
                (o, oidx) =>
                    oidx !== idx &&
                    o.name?.trim().toLowerCase() === name
            );

            if (duplicate) {
                errors[`company-${idx}-name`] = "Duplicate company name";
            }
        });

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            showError("Please fix highlighted errors before saving");
            return;
        }

        // ================= SAVE =================
        try {
            const response = await apiService.post("/Company/bulk", newCompanies);

            if (response?.status) {
                await loadCompanies();
                setNewCompanies([]);
                showSuccess("Saved successfully!");
            } else {
                showError(response?.error ?? "Save failed");
            }
        } catch (err) {
            console.error(err);
            showError("Error saving companies");
        }
    };

    const handleOpenEdit = (company: CompanyModel) => {
        setSelectedCompany({ ...company });
        setSidebarVisible(true);
    };

    const handleUpdateCompany = async (updated: CompanyModel) => {
        try {
            const response = await apiService.put(`/Company/${updated.id}`, updated);
            if (response && response.status) {
                await loadCompanies();
                showSuccess("Company updated successfully!");
                setSidebarVisible(false);
            } else {
                showError(response.error ?? "Save failed");
            }

        } catch (err) {
            console.error(err);
            showError("Error updating company");
        }
    };

    const handleDeleteCompanies = async (rows: CompanyModel[]) => {
        try {
            const ids = rows.map(r => r.id);
            await apiService.post("/Company/bulk-delete", ids);
            showSuccess("Company(s) deleted successfully!");
            await loadCompanies();
        } catch (err) {
            console.error(err);
            showError("Error deleting companies");
        }
    };

    const columns: ColumnMeta<CompanyModel>[] = [
        { field: "id", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "name", header: "Company Name", width: "220px", frozen: true, required: true },
        { field: "phone", header: "Phone", width: "150px", required: true },
        { field: "email", header: "Email", width: "200px" },
        { field: "city", header: "City", width: "140px" },
        { field: "districtName", header: "District", width: "140px" },
        { field: "stateName", header: "State", width: "140px" },
        { field: "countryName", header: "Country", width: "140px" },
        {
            field: "parentCompanyName",
            header: "Parent Company",
            width: "160px",
            body: (row) => row.parentCompanyId == null ? "Yes" : "Child"
        },
        { field: "isActive", header: "Active", width: "100px", body: row => row.isActive ? "✅" : "❌", editable: false },
    ];

    if (loading) return <p>Loading companies...</p>;

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">🏢 Company Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-building" />
                        <span>Companies</span>
                    </div>
                }>
                    <TTypeDatatable<CompanyModel>
                        data={companies}
                        columns={columns}
                        primaryKey="id"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        onDelete={handleDeleteCompanies}
                        isNew={false}
                        isEdit={true}
                        isSave={false}
                        sortableColumns={['name', 'phone', 'city']}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="flex gap-2 mb-4">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewCompany} className="p-button-info custom-xs" />
                        {newCompanies.length > 0 && (<Button label="Save" icon="pi pi-save" onClick={handleSaveCompanies} className="p-button-sm custom-xs" />)}
                    </div>

                    {newCompanies.length === 0 ? (
                        <p className="text-gray-500">Click “Add New” to create.</p>
                    ) : (
                        newCompanies.map((c, idx) => (
                            <CompanyForm
                                key={idx}
                                company={c}
                                index={idx}
                                onSave={(updated) => handleUpdateNewCompany(idx, updated)}
                                onCancel={() => handleRemoveNewCompany(idx)}
                                isEditSidebar={false}
                                validationErrors={validationErrors}
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
                showCloseIcon={false}
            >
                {selectedCompany ? (
                    <CompanyForm
                        company={selectedCompany}
                        onSave={handleUpdateCompany}
                        onCancel={() => setSidebarVisible(false)}
                        isEditSidebar={true}
                    />
                ) : (
                    <p className="p-4 text-gray-500 text-center">Select a company to edit.</p>
                )}
            </Sidebar>
        </div>
    );
}
