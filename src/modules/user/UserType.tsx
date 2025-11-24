import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../components/TTypedDatatable";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { UserTypeModel } from "../../models/UserTypeModel";

export default function UserType() {
    const [roles, setRoles] = useState<UserTypeModel[]>([]);
    const [activeRoles, setActiveRoles] = useState<UserTypeModel[]>([]);
    const [inActiveRoles, setInActiveRoles] = useState<UserTypeModel[]>([]);
    const { showSuccess, showError } = useToast();

    const baseColumns: ColumnMeta<UserTypeModel>[] = [
        { field: "id", header: "ID", editable: false, hidden: true },
        { field: "name", header: "User Type Name", editable: true, required: true, placeholder: "Usertype name" },
        { field: "description", header: "Description", editable: true, placeholder: "description" },
        { field: "isActive", header: "Active", editable: true, type: "checkbox" },
    ];

    // Columns for active tab (hide isActive)
    const activeColumns = baseColumns.filter(col => col.field !== "isActive");
    const inactiveColumns = baseColumns;

    const fetchRoles = async () => {
        try {
            const response = await apiService.get("/UserTypes");
            const rolesArray: UserTypeModel[] = response ?? [];

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
        updatedRoles: UserTypeModel[],
        isActiveTab: boolean,
        isDelete: boolean
    ): Promise<void> => {
        try {
            // Save categories via API
            await apiService.post("/UserTypes/bulk", updatedRoles);

            // Fetch the latest categories
            const response = await apiService.get("/UserTypes");
            const latestRoles: UserTypeModel[] = response ?? [];

            // Update frontend state
            setActiveRoles(latestRoles.filter(c => c.isActive));
            setInActiveRoles(latestRoles.filter(c => !c.isActive));
            setRoles(latestRoles);
            if (!isDelete)
                showSuccess("User type saved successfully!");
            else
                showSuccess("User type deleted successfully!");
        } catch (error) {
            console.error("Failed to save role", error);
            showError("Error saving UserTypes. Please try again.");
        }
    };

    // ✅ Make handlers async and await save
    const onActiveSave = async (updated: UserTypeModel[]) => {
        const updatedWithActive = updated.map(c => ({ ...c, isActive: true }));
        await saveRoles(updatedWithActive, true, false);
    };

    const onInactiveSave = async (updated: UserTypeModel[]) => {
        await saveRoles(updated, false, false);
    };

    const onActiveDelete = async (toDelete: UserTypeModel[]) => {
        const updatedWithActive = toDelete.map(c => ({ ...c, isActive: false }));
        await saveRoles(updatedWithActive, true, true);
    }

    return (
        <div className="p-2">
            <h2 className="mb-1 text-lg font-semibold">🧩 UserType Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'green' }}>
                        <i className="pi pi-check-circle" />
                        <span>Active</span>
                    </div>}>
                    <TTypedDatatable<UserTypeModel>
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
                    <TTypeDatatable<UserTypeModel>
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