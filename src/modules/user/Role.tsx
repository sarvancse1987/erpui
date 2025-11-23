import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../components/TTypedDatatable";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { RoleModel } from "../../models/RoleModel";

export default function Role() {
    const [roles, setRoles] = useState<RoleModel[]>([]);
    const [activeRoles, setActiveRoles] = useState<RoleModel[]>([]);
    const [inActiveRoles, setInActiveRoles] = useState<RoleModel[]>([]);
    const { showSuccess, showError } = useToast();

    const baseColumns: ColumnMeta<RoleModel>[] = [
        { field: "id", header: "ID", editable: false, hidden: true },
        { field: "name", header: "Role Name", editable: true, required: true },
        { field: "description", header: "Description", editable: true },
        { field: "isActive", header: "Active", editable: true, type: "checkbox" },
    ];

    // Columns for active tab (hide isActive)
    const activeColumns = baseColumns.filter(col => col.field !== "isActive");
    const inactiveColumns = baseColumns;

    const fetchRoles = async () => {
        try {
            const response = await apiService.get("/Roles");
            const rolesArray: RoleModel[] = response ?? [];

            setActiveRoles(rolesArray.filter(c => c.isActive));
            setInActiveRoles(rolesArray.filter(c => !c.isActive));
            setRoles(rolesArray);
        } catch (error) {
            console.error("Failed to fetch roles", error);
            setActiveRoles([]);
            setInActiveRoles([]);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const saveRoles = async (
        updatedRoles: RoleModel[],
        isActiveTab: boolean
    ): Promise<void> => {
        try {
            // Save categories via API
            await apiService.post("/Roles/bulk", updatedRoles);

            // Fetch the latest categories
            const response = await apiService.get("/Roles");
            const latestRoles: RoleModel[] = response ?? [];

            // Update frontend state
            setActiveRoles(latestRoles.filter(c => c.isActive));
            setInActiveRoles(latestRoles.filter(c => !c.isActive));
            setRoles(latestRoles);
            showSuccess("Roles saved successfully!");
        } catch (error) {
            console.error("Failed to save role", error);
            showError("Error saving roles. Please try again.");
        }
    };

    // ✅ Make handlers async and await save
    const onActiveSave = async (updated: RoleModel[]) => {
        const updatedWithActive = updated.map(c => ({ ...c, isActive: true }));
        await saveRoles(updatedWithActive, true);
    };

    const onInactiveSave = async (updated: RoleModel[]) => {
        await saveRoles(updated, false);
    };

    const onActiveDelete = async (toDelete: RoleModel[]) => {
        const updatedWithActive = toDelete.map(c => ({ ...c, isActive: false }));
        await saveRoles(updatedWithActive, true);
    }

    return (
        <div className="p-2">
            <h2 className="mb-1 text-lg font-semibold">🧩 Role Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'green' }}>
                        <i className="pi pi-check-circle" />
                        <span>Active</span>
                    </div>}>
                    <TTypedDatatable<RoleModel>
                        columns={activeColumns}
                        data={activeRoles.map(c => ({ ...c, isActive: true }))}
                        primaryKey="id"
                        onSave={onActiveSave}
                        onDelete={onActiveDelete}
                        isNew={true}
                        isSave={true}
                        isDelete={true}
                        sortableColumns={['name']}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'red' }}>
                    <i className="pi pi-times-circle" />
                    <span>Inactive</span>
                </div>}>
                    <TTypeDatatable<RoleModel>
                        columns={inactiveColumns}
                        data={inActiveRoles}
                        primaryKey="id"
                        onSave={onInactiveSave}
                        isNew={true}
                        isSave={true}
                        isDelete={true}
                    />
                </TabPanel>
            </TabView>
        </div>
    );
}