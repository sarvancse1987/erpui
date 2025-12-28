import React, { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { UsersForm } from "./UsersForm";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { UserModel } from "../../models/UserModel";
import { storage } from "../../services/storageService";

export default function UserList() {
    const [users, setUsers] = useState<UserModel[]>([]);
    const [newUsers, setNewUsers] = useState<UserModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { showSuccess, showError } = useToast();

    const loadUsers = async () => {
        setLoading(true);
        const user = storage.getUser();
        try {
            const res = await apiService.get(`/Users/getallusers/${Number(user?.companyId)}`);
            setUsers(res.users ?? []);
        } catch (err) {
            console.error("Error loading users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const createEmptyUser = (): UserModel => ({
        id: 0,
        username: "",
        passwordHash: "",
        salutation: "Mr.",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        roleId: 0,
        userTypeId: 0,
        companyId: 0,
        locationId: 0,
        isActive: true,
    });

    const addNewUser = () => setNewUsers(prev => [createEmptyUser(), ...prev]);

    const handleUpdateNewUser = (index: number, updated: UserModel) => {
        setNewUsers(prev => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };

    const handleRemoveNewUser = (index: number) => {
        setNewUsers(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveUsers = async () => {
        const errors: Record<string, string> = {};
        newUsers.forEach((u, idx) => {
            if (!u.username.trim()) errors[`user-${idx}-username`] = "Username required";
            if (!u.firstName.trim()) errors[`user-${idx}-firstName`] = "First name required";
            if (!u.email.trim()) errors[`user-${idx}-email`] = "Email required";
            if (!u.roleId) errors[`user-${idx}-roleId`] = "Role required";
            if (!u.userTypeId) errors[`user-${idx}-userTypeId`] = "User type required";
            if (!u.companyId) errors[`user-${idx}-companyId`] = "Company required";
            if (!u.locationId) errors[`user-${idx}-locationId`] = "Location required";
        });

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await apiService.post("/Users/bulk", newUsers);
            await loadUsers();
            setNewUsers([]);
            showSuccess("Users saved successfully!");
        } catch (err) {
            console.error(err);
            showError("Error saving users");
        }
    };

    const handleOpenEdit = (user: UserModel) => {
        setSelectedUser({ ...user });
        setSidebarVisible(true);
    };

    const handleUpdateUser = async (updated: UserModel) => {
        try {
            await apiService.put(`/Users/${updated.id}`, updated);
            await loadUsers();
            showSuccess("User updated successfully!");
            setSidebarVisible(false);
        } catch (err) {
            console.error(err);
            showError("Error updating user");
        }
    };

    const handleDeleteUsers = async (rows: UserModel[]) => {
        try {
            const ids = rows.map(r => r.id);
            await apiService.post("/Users/bulk-delete", ids);
            showSuccess("User(s) deleted successfully!");
            await loadUsers();
        } catch (err) {
            console.error(err);
            showError("Error deleting users");
        }
    };

    const columns: ColumnMeta<UserModel>[] = [
        { field: "id", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "username", header: "Username", width: "200px", frozen: true, required: true },
        { field: "firstName", header: "First Name", width: "180px", required: true },
        { field: "lastName", header: "Last Name", width: "180px" },
        { field: "email", header: "Email", width: "220px", required: true },
        { field: "phone", header: "Phone", width: "150px" },
        { field: "roleName", header: "Role", width: "140px", required: true },
        { field: "userTypeName", header: "User Type", width: "140px", required: true },
        { field: "companyName", header: "Company", width: "140px", required: true },
        { field: "locationName", header: "Location", width: "140px", required: true },
        { field: "isActive", header: "Active", width: "100px", body: row => row.isActive ? "✅" : "❌", editable: false },
    ];

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">👤 User Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-users" />
                        <span>Users</span>
                    </div>
                }>
                    <TTypeDatatable<UserModel>
                        data={users}
                        columns={columns}
                        primaryKey="id"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        onDelete={handleDeleteUsers}
                        isNew={false}
                        isSave={false}
                        sortableColumns={['username', 'firstName', 'companyName']}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="flex gap-2 mb-4">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewUser} className="p-button-info custom-xs" />
                        {newUsers.length > 0 && (<Button label="Save" icon="pi pi-save" onClick={handleSaveUsers} className="p-button-sm custom-xs" />)}
                    </div>

                    {newUsers.length === 0 ? (
                        <p className="text-gray-500">No new users. Click “Add New” to create.</p>
                    ) : (
                        newUsers.map((u, idx) => (
                            <UsersForm
                                key={idx}
                                user={u}
                                onSave={(updated) => handleUpdateNewUser(idx, updated)}
                                onCancel={() => handleRemoveNewUser(idx)}
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
                {selectedUser ? (
                    <UsersForm
                        user={selectedUser}
                        onSave={handleUpdateUser}
                        onCancel={() => setSidebarVisible(false)}
                        isEditSidebar={true}
                        validationErrors={validationErrors}
                    />
                ) : (
                    <p className="p-4 text-gray-500 text-center">Select a user to edit.</p>
                )}
            </Sidebar>
        </div>
    );
}
