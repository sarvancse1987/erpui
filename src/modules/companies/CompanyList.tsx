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

export default function CompanyList() {
    const [companies, setCompanies] = useState<CompanyModel[]>([]);
    const [newCompanies, setNewCompanies] = useState<CompanyModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedCompany, setSelectedCompany] = useState<CompanyModel | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { showSuccess, showError } = useToast();

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const res = await apiService.get(`/Company/getcompany/${Number(localStorage.getItem("companyId"))}`);
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
        newCompanies.forEach((c, idx) => {
            c.companyId = Number(localStorage.getItem("companyId"));
            if (c.name.trim().length === 0) {
                errors[`company-${idx}-name`] = "Company name required";
            }

            if (!c.name.trim()) {
                errors[`company-${idx}-name`] = "Company name required";
            }
            if (!c.phone?.trim()) errors[`company-${idx}-phone`] = "Phone required";
            if (c.email?.trim()) {
                if (c.email?.trim() != undefined && c.email?.trim() !== "") {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(c.email.trim())) {
                        errors[`comapny-${idx}-email`] = "Valid email required";
                    }
                }
            }

            if (c.countryId === 0) {
                c.countryId = null;
            }
            if (c.stateId === 0) {
                c.stateId = null;
            }
            if (c.districtId === 0) {
                c.districtId = null;
            }
        });

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await apiService.post("/Company/bulk", newCompanies);
            await loadCompanies();
            setNewCompanies([]);
            showSuccess("Companies saved successfully!");
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
            await apiService.put(`/Company/${updated.id}`, updated);
            await loadCompanies();
            showSuccess("Company updated successfully!");
            setSidebarVisible(false);
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
        { field: "name", header: "Company Name", width: "220px", frozen: true },
        { field: "phone", header: "Phone", width: "150px" },
        { field: "email", header: "Email", width: "200px" },
        { field: "city", header: "City", width: "140px" },
        { field: "districtName", header: "District", width: "140px" },
        { field: "stateName", header: "State", width: "140px" },
        { field: "countryName", header: "Country", width: "140px" },
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
                        isSave={false}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'green' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="flex gap-2 mb-4">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewCompany} className="p-button-sm custom-xs" />
                        <Button label="Save" icon="pi pi-save" onClick={handleSaveCompanies} disabled={!newCompanies.length} className="p-button-sm custom-xs" />
                    </div>

                    {newCompanies.length === 0 ? (
                        <p className="text-gray-500">No new companies. Click “Add New” to create.</p>
                    ) : (
                        newCompanies.map((c, idx) => (
                            <CompanyForm
                                key={idx}
                                company={c}
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
                header="Edit Company"
                style={{ width: "70rem" }}
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
