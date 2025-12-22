import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";

interface UserTypeFormProps {
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

export const UserTypeForm: React.FC<UserTypeFormProps> = ({
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
        const hasError = roles.some(
            r => !r.name || r.name.trim().length === 0
        );

        setRoles(prev =>
            prev.map(r => ({
                ...r,
                error: !r.name || r.name.trim().length === 0
            }))
        );

        if (hasError) {
            showError("Please fill all usertype names");
            return;
        }

        const payload = roles.map(r => ({
            roleId: r.roleId ?? 0,
            id: r.id ?? 0,
            name: r.name.trim(),
            description: r.description?.trim() ?? "",
            isActive: true
        }));

        const response = await apiService.post("/UserTypes/bulk", payload);
        if (response) {
            showSuccess("UserTypes saved successfully");
            onSave?.(true);
        }
    };

    return (
        <fieldset className="border border-gray-300 rounded-md p-3 bg-white">
            <legend className="text-sm font-semibold px-2 text-gray-700">
                Add Usertype
            </legend>

            {/* ================= ROLE MASTER ================= */}

            {roles.map((role, ci) => (
                <div key={ci} className="flex gap-2 mb-2">

                    <div className="mb-2">
                        <label className="font-medium text-sm">Usertype Name</label>
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
                            placeholder="Usertype name"
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
                <Button icon="pi pi-plus" label="Add Role" outlined onClick={() => addRow(roles, setRoles)} className="p-button-sm custom-xs" />
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <Button label="Cancel" outlined severity="danger" onClick={onCancel} className="p-button-sm custom-xs" icon="pi pi-times-circle" style={{ color: 'red' }} />
                <Button label="Save" icon="pi pi-save" severity="success" onClick={() => { saveData() }} className="p-button-sm custom-xs" />
            </div>

        </fieldset >
    )
};