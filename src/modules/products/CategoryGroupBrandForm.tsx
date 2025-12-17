import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { GroupModel } from "../../models/product/GroupModel";
import { useToast } from "../../components/ToastService";

export type AddType = "CATEGORY" | "GROUP" | "BRAND";

interface Props {
  type: AddType;
  onCancel?: () => void;
  onSave?: (saved: boolean) => void;
}

interface Option {
  label: string;
  value: number;
}

interface GroupInput {
  id: string;
  name: string;
  error?: boolean;
}

export const CategoryGroupBrandForm: React.FC<Props> = ({ type, onCancel, onSave }) => {
  const [categories, setCategories] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");

  const [groupInputs, setGroupInputs] = useState<GroupInput[]>([
    { id: crypto.randomUUID(), name: "" }
  ]);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (type !== "CATEGORY") {
      loadCategories();
    }
  }, [type]);

  useEffect(() => {
    if (type === "BRAND" && categoryId) {
      loadGroups(categoryId);
    }
  }, [type, categoryId]);

  const loadCategories = async () => {
    const res = await apiService.get("/ProductCategory/hierarchy?includeCategories=true");
    const data = res.categories ?? [];

    setCategories(
      data
        .filter((c: any) => c.isActive)
        .map((c: any) => ({
          label: c.categoryName,
          value: c.categoryId
        }))
    );
  };

  const loadGroups = async (categoryId: number) => {
    setGroups([
      { label: "Mobile", value: 1 },
      { label: "Laptop", value: 2 }
    ]);
  };

  const addGroupRow = () => {
    setGroupInputs(prev => [...prev, { id: crypto.randomUUID(), name: "" }]);
  };

  const removeGroupRow = (id: string) => {
    setGroupInputs(prev => prev.filter(g => g.id !== id));
  };

  const updateGroupName = (id: string, value: string) => {
    setGroupInputs(prev =>
      prev.map(g => (g.id === id ? { ...g, name: value, error: false } : g))
    );
  };

  const handleSave = () => {
    if (type === "CATEGORY") {
      if (!categoryName.trim()) return;
      console.log("Save Category:", categoryName);
      return;
    }

    if (type === "GROUP") {
      let valid = true;
      const names = groupInputs.map(g => g.name.trim());
      const updated = groupInputs.map((g, idx) => {
        let error = false;
        if (!g.name.trim()) error = true;
        if (names.indexOf(g.name.trim()) !== idx) error = true;
        if (error) valid = false;
        return { ...g, error };
      });

      setGroupInputs(updated);
      if (!categoryId || !valid) return;

      const payload = updated.map(g => ({
        categoryId,
        groupName: g.name.trim(),
        isActive: true
      }));

      handleGroupSave(payload);
      return;
    }

    if (type === "BRAND") {
      if (!categoryId || !groupId || !brandName.trim()) return;
      console.log("Save Brand:", { categoryId, groupId, brandName });
    }
  };

  const legendMap: Record<AddType, string> = {
    CATEGORY: "Add Category",
    GROUP: "Add Group",
    BRAND: "Add Brand"
  };

  const handleGroupSave = async (updatedGroups: any[]) => {
    try {
      const response = await apiService.post("/ProductGroup/bulk", updatedGroups);
      if (response) {
        showSuccess("Groups saved successfully!");
        onCancel?.();
        onSave?.(true);
      }
    } catch (error) {
      showError("Error saving groups. Please try again.");
    }
  };

  return (
    <fieldset className="border border-gray-300 rounded-md p-3 bg-white">
      <legend className="text-sm font-semibold px-2 text-gray-700">
        {legendMap[type]}
      </legend>

      <div className="flex flex-wrap gap-3">

        {/* CATEGORY */}
        {type === "CATEGORY" && (
          <InputText
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className="w-full"
          />
        )}

        {/* GROUP MULTI ADD */}
        {type === "GROUP" && (
          <>
            <div className="flex-1 min-w-[160px]">
              <Dropdown
                value={categoryId}
                options={categories}
                placeholder="Select Category"
                className="w-full"
                onChange={(e) => {
                  setCategoryId(e.value);
                  setGroupInputs([{ id: crypto.randomUUID(), name: "" }]);
                }}
                filter
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              {groupInputs.map((g, i) => (
                <div key={g.id} className="flex gap-2 items-center mb-1">
                  <InputText
                    value={g.name}
                    onChange={(e) => updateGroupName(g.id, e.target.value)}
                    placeholder={`Group Name ${i + 1}`}
                    disabled={!categoryId}
                    className={`flex-1 ${g.error ? "p-invalid" : ""}`}
                  />

                  {groupInputs.length > 1 && (
                    <Button icon="pi pi-trash" severity="danger" outlined className="p-button-sm" onClick={() => removeGroupRow(g.id)} />
                  )}
                </div>
              ))}
            </div>

            <Button icon="pi pi-plus" label="Add Another Group" text disabled={!categoryId} onClick={addGroupRow} />
          </>
        )}

        {/* BRAND */}
        {type === "BRAND" && (
          <>
            <div className="flex-1 min-w-[160px]">
              <Dropdown
                value={categoryId}
                options={categories}
                placeholder="Select Category"
                className="w-full"
                onChange={(e) => {
                  setCategoryId(e.value);
                  setGroupId(null);
                }}
                filter
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <Dropdown
                value={groupId}
                options={groups}
                placeholder="Select Group"
                disabled={!categoryId}
                className="w-full"
                onChange={(e) => setGroupId(e.value)}
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <InputText
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Brand Name"
                disabled={!groupId}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 w-full mt-3">
          <Button
            label="Cancel"
            icon="pi pi-times-circle"
            outlined
            severity="danger"
            onClick={onCancel}
            className="p-button-sm custom-xs"
          />
          <Button
            label="Save"
            icon="pi pi-save"
            severity="success"
            onClick={handleSave}
            className="p-button-sm custom-xs"
          />
        </div>
      </div>
    </fieldset>
  );
};
