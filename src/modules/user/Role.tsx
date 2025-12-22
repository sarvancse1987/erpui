import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../components/TTypedDatatable";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { RoleModel } from "../../models/RoleModel";
import { Sidebar } from "primereact/sidebar";
import { RoleForm } from "./RoleForm";

export default function Role() {
    const [roles, setRoles] = useState<RoleModel[]>([]);
    const [activeRoles, setActiveRoles] = useState<RoleModel[]>([]);
    const [inActiveRoles, setInActiveRoles] = useState<RoleModel[]>([]);
    const { showSuccess, showError } = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [editedRows, setEditedRows] = useState<any[]>([]);

    const baseColumns: ColumnMeta<RoleModel>[] = [
        { field: "id", header: "ID", editable: false, hidden: true },
        { field: "name", header: "Role Name", editable: true, required: true, placeholder: "Role name" },
        { field: "description", header: "Description", editable: true, placeholder: "Description" },
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
        isActiveTab: boolean,
        isDelete: boolean
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
            if (!isDelete)
                showSuccess("Role saved successfully!");
            else
                showSuccess("Role deleted successfully!");
        } catch (error) {
            console.error("Failed to save role", error);
            showError("Error saving roles. Please try again.");
        }
    };

    // ✅ Make handlers async and await save
    const onActiveSave = async (updated: RoleModel[]) => {
        const updatedWithActive = updated.map(c => ({ ...c, isActive: true }));
        await saveRoles(updatedWithActive, true, false);
    };

    const onInactiveSave = async (updated: RoleModel[]) => {
        await saveRoles(updated, false, false);
    };

    const onActiveDelete = async (toDelete: RoleModel[]) => {
        const updatedWithActive = toDelete.map(c => ({ ...c, isActive: false }));
        await saveRoles(updatedWithActive, true, true);
    }

    const onAdd = () => {
        setSidebarVisible(true);
    }

    const onEdit = (row: any) => {
        setEditedRows([row]);
        setSidebarVisible(true);
    }

    const onEditMultiple = (rows: any[]) => {
        setEditedRows(rows);
        setSidebarVisible(true);
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
                        onAdd={onAdd}
                        onEdit={onEdit}
                        onEditMultiple={onEditMultiple}
                        isNew={true}
                        isEdit={true}
                        isSave={true}
                        isDelete={true}
                        sortableColumns={['name']}
                    // onEdit={ }
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

            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                style={{ width: '35rem', height: '100%' }}
                showCloseIcon={true}
                header="Add Role"
            >
                <RoleForm onSave={() => { fetchRoles(); setSidebarVisible(false); }} onCancel={() => { setSidebarVisible(false) }} editedRow={editedRows} />
            </Sidebar>
        </div>
    );
}