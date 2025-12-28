import React, { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { LocationForm } from "./LocationForm";
import { LocationModel } from "../../models/LocationModel";
import { storage } from "../../services/storageService";

export default function LocationList() {
    const [locations, setLocations] = useState<LocationModel[]>([]);
    const [newLocations, setNewLocations] = useState<LocationModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedLocation, setSelectedLocation] = useState<LocationModel | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { showSuccess, showError } = useToast();
    const user = storage.getUser();

    const loadLocations = async () => {
        setLoading(true);
        try {
            const res = await apiService.get(`/Location/details/${Number(user?.companyId)}`);
            setLocations(res.locations ?? []);
        } catch (err) {
            console.error("Error loading locations:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const createEmptyLocation = (): LocationModel => ({
        id: 0,
        name: "",
        address: "",
        phone: "",
        email: "",
        pincode: "",
        stateId: null,
        countryId: null,
        districtId: null,
        companyId: 0,
        isActive: true
    });

    const addNewLocation = () =>
        setNewLocations((prev) => [createEmptyLocation(), ...prev]);

    const handleUpdateNewLocation = (index: number, updated: LocationModel) => {
        setNewLocations((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };

    const handleRemoveNewLocation = (index: number) => {
        setNewLocations((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveLocations = async () => {
        const errors: Record<string, string> = {};

        newLocations.forEach((l, idx) => {
            if (l.companyId == 0) {
                errors[`location-${idx}-companyId`] = "Company name required";
            }

            if (!l.name.trim()) {
                errors[`location-${idx}-name`] = "Location name required";
            }
            if (!l.phone?.trim()) errors[`location-${idx}-phone`] = "Phone required";

            if (l.email?.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(l.email.trim())) {
                    errors[`location-${idx}-email`] = "Valid email required";
                }
            }

            if (l.countryId === 0) l.countryId = null;
            if (l.stateId === 0) l.stateId = null;
            if (l.districtId === 0) l.districtId = null;
        });

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await apiService.post("/Location/bulk", newLocations);
            await loadLocations();
            setNewLocations([]);
            showSuccess("Locations saved successfully!");
        } catch (err) {
            console.error(err);
            showError("Error saving locations");
        }
    };

    const handleOpenEdit = (loc: LocationModel) => {
        setSelectedLocation({ ...loc });
        setSidebarVisible(true);
    };

    const handleUpdateLocation = async (updated: LocationModel) => {
        try {
            await apiService.put(`/Location/${updated.id}`, updated);
            await loadLocations();
            showSuccess("Location updated successfully!");
            setSidebarVisible(false);
        } catch (err) {
            console.error(err);
            showError("Error updating location");
        }
    };

    const handleDeleteLocations = async (rows: LocationModel[]) => {
        try {
            const ids = rows.map(r => r.id);
            await apiService.post("/Location/bulk-delete", ids);
            showSuccess("Location(s) deleted successfully!");
            await loadLocations();
        } catch (err) {
            console.error(err);
            showError("Error deleting locations");
        }
    };

    const columns: ColumnMeta<LocationModel>[] = [
        { field: "id", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "name", header: "Location", width: "220px", frozen: true },
        { field: "companyName", header: "Company Name", width: "220px" },
        { field: "phone", header: "Phone", width: "150px" },
        { field: "email", header: "Email", width: "200px" },
        { field: "pincode", header: "Pincode", width: "120px" },
        { field: "districtName", header: "District", width: "140px" },
        { field: "stateName", header: "State", width: "140px" },
        { field: "countryName", header: "Country", width: "140px" },
        { field: "isActive", header: "Active", width: "100px", body: row => row.isActive ? "✅" : "❌", editable: false },
    ];

    if (loading) return <p>Loading locations...</p>;

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">📍 Location Management</h2>

            <TabView>
                {/* === LIST TAB === */}
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-map-marker" />
                        <span>Locations</span>
                    </div>
                }>
                    <TTypeDatatable<LocationModel>
                        data={locations}
                        columns={columns}
                        primaryKey="id"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        onDelete={handleDeleteLocations}
                        isNew={false}
                        isSave={false}
                    />
                </TabPanel>

                {/* === ADD NEW TAB === */}
                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="flex gap-2 mb-4">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewLocation} className="p-button-info custom-xs" />
                        {newLocations.length > 0 && (<Button label="Save" icon="pi pi-save" onClick={handleSaveLocations} className="p-button-sm custom-xs" />)}
                    </div>

                    {newLocations.length === 0 ? (
                        <p className="text-gray-500">No new locations. Click “Add New” to create.</p>
                    ) : (
                        newLocations.map((loc, idx) => (
                            <LocationForm
                                key={idx}
                                location={loc}
                                onSave={(updated) => handleUpdateNewLocation(idx, updated)}
                                onCancel={() => handleRemoveNewLocation(idx)}
                                isEditSidebar={false}
                                validationErrors={validationErrors}
                            />
                        ))
                    )}
                </TabPanel>
            </TabView>

            {/* === EDIT SIDEBAR === */}
            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                style={{ width: '75rem', height: '100%' }}
                showCloseIcon={false}
            >
                {selectedLocation ? (
                    <LocationForm
                        location={selectedLocation}
                        onSave={handleUpdateLocation}
                        onCancel={() => setSidebarVisible(false)}
                        isEditSidebar={true}
                    />
                ) : (
                    <p className="p-4 text-gray-500 text-center">Select a location to edit.</p>
                )}
            </Sidebar>
        </div>
    );
}
