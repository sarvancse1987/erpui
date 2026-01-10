import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";

interface RoleFormProps {
    onSave: (isSuccess: boolean) => void;
    onCancel: () => void;
    editedRow?: any;
}

interface MasterItem {
    roleId: string;
    id?: number;
    name: string;
    description: string;
    error?: boolean;
}

export const RoleForm: React.FC<RoleFormProps> = ({
    onSave, onCancel, editedRow
}) => {

    const { showSuccess, showError } = useToast();

    const emptyRoleOnly = (): any => ({
        roleId: crypto.randomUUID(),
        name: "",
        description: ""
    });

    const [roles, setRoles] = useState<MasterItem[]>([
        {
            roleId: crypto.randomUUID(),
            name: "",
            description: ""
        }
    ]);

    useEffect(() => {
        if (editedRow?.length) {
            setRoles(
                editedRow.map((c: any) => ({
                    roleId: crypto.randomUUID(),
                    id: c.id,
                    name: c.name,
                    description: c.description
                }))
            );
        }
    }, [editedRow]);

    const addRow = (list: MasterItem[], setList: any) => {
        setList([...list, { name: "", description: "" }]);
    };

    const removeRow = (list: MasterItem[], setList: any, index: number) => {
        setList(list.filter((_, i) => i !== index));
    };

    const saveData = async () => {
        let hasError = false;

        // Normalize names
        const nameMap: Record<string, number[]> = {};

        roles.forEach((r, index) => {
            const name = r.name?.trim().toLowerCase();

            if (!name) {
                hasError = true;
                return;
            }

            if (!nameMap[name]) {
                nameMap[name] = [];
            }
            nameMap[name].push(index);
        });

        // Detect duplicates
        const duplicateIndexes = new Set<number>();
        Object.values(nameMap).forEach(indexes => {
            if (indexes.length > 1) {
                indexes.forEach(i => duplicateIndexes.add(i));
                hasError = true;
            }
        });

        // Set error flags
        setRoles(prev =>
            prev.map((r, idx) => ({
                ...r,
                error:
                    !r.name ||
                    r.name.trim().length === 0 ||
                    duplicateIndexes.has(idx)
            }))
        );

        if (hasError) {
            showError("Role name is required and must be unique");
            return;
        }

        // ✅ API payload
        const payload = roles.map(r => ({
            roleId: r.roleId ?? 0,
            id: r.id ?? 0,
            name: r.name.trim(),
            description: r.description?.trim() ?? "",
            isActive: true
        }));

        const response = await apiService.post("/Roles/bulk", payload);
        if (response && response.status) {
            showSuccess("Roles saved successfully");
            onSave?.(true);
        } else {
            showError(response.error ?? "Roles save failed");
        }
    };

    return (
        <fieldset className="border border-gray-300 rounded-md p-3 bg-white">
            <legend className="text-sm font-semibold px-2 text-gray-700">
                Add Role
            </legend>

            {/* ================= ROLE MASTER ================= */}

            {roles.map((role, ci) => (
                <div key={ci} className="flex gap-2 mb-2">

                    <div className="mb-2">
                        <label className="font-medium text-sm">Role Name</label>
                        <InputText
                            value={role.name}
                            onChange={(e) =>
                                setRoles(r =>
                                    r.map((c, i) =>
                                        i === ci ? { ...c, name: e.target.value, error: false } : c
                                    )
                                )
                            }
                            className={`flex-1 ${role.error ? "p-invalid" : ""}`}
                            placeholder="Role name"
                        />
                    </div>

                    <div className="mb-2">
                        <label className="font-medium text-sm">Description</label>
                        <InputTextarea
                            rows={2}
                            value={role.description}
                            onChange={(e) =>
                                setRoles(r =>
                                    r.map((c, i) =>
                                        i === ci ? { ...c, description: e.target.value, error: false } : c
                                    )
                                )
                            }
                            className="w-full"
                            placeholder="Description"
                        />
                    </div>

                    {roles.length > 1 && (
                        <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            onClick={() => removeRow(roles, setRoles, ci)}
                        />
                    )}
                </div>
            ))}



            <div className="flex justify-content-between">
                <Button icon="pi pi-plus" label="Add Role" outlined onClick={() => addRow(roles, setRoles)} className="p-button-info custom-xs" />
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <Button label="Cancel" outlined severity="danger" onClick={onCancel} className="p-button-sm custom-xs" icon="pi pi-times-circle" style={{ color: 'red' }} />
                <Button label="Save" icon="pi pi-save" onClick={() => { saveData() }} className="p-button-sm custom-xs" />
            </div>

        </fieldset >
    )
};