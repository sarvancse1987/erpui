import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { GroupModel } from "../../models/product/GroupModel";

export type AddType = "CATEGORY" | "GROUP" | "BRAND";

interface CategoryGroupBrandFormProps {
  type: AddType;
  onCancel?: () => void;
  onSave?: (saved: boolean) => void;
}

interface Option {
  label: string;
  value: number;
}

/* =======================
   MODELS
======================= */

interface BrandRow {
  id: string;
  name: string;
  error?: boolean;
}

interface GroupOption extends Option {
  categoryId: number;
}

interface GroupRow {
  id: string;
  name: string;
  categoryId?: number;
  groupId?: number;
  brands: BrandRow[];
  error?: boolean;
  filteredGroups?: GroupOption[];
}

interface CategoryRow {
  id: string;
  categoryId?: number;
  groups: GroupRow[];
  error?: boolean;
}

/* =======================
   COMPONENT
======================= */

export const CategoryGroupBrandForm: React.FC<CategoryGroupBrandFormProps> = ({
  type,
  onCancel,
  onSave
}) => {
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState<Option[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupOption[]>([]);

  /* =======================
     HELPERS
  ======================= */

  const emptyBrand = (): BrandRow => ({
    id: crypto.randomUUID(),
    name: ""
  });

  const emptyGroup = (): GroupRow => ({
    id: crypto.randomUUID(),
    name: "",
    brands: [emptyBrand()]
  });

  const emptyCategory = (): CategoryRow => ({
    id: crypto.randomUUID(),
    groups: [emptyGroup()]
  });

  const [rows, setRows] = useState<CategoryRow[]>([emptyCategory()]);
  const [groupRows, setGroupRows] = useState<GroupRow[]>([emptyGroup()]);

  /* =======================
     LOAD DATA
  ======================= */

  useEffect(() => {
    if (type !== "CATEGORY") {
      loadCategories();
    }
  }, [type]);

  const loadCategories = async () => {
    const res = await apiService.get("/ProductCategory/hierarchy?includeCategories=true&includeGroups=true");
    const categories = res.categories ?? [];
    const groups = res.groups.filter((c: any) => c.isActive)
      .map((c: any) => ({
        label: c.groupName,
        value: c.groupId,
        categoryId: c.categoryId
      })) ?? [];

    setCategories(
      categories
        .filter((c: any) => c.isActive)
        .map((c: any) => ({
          label: c.categoryName,
          value: c.categoryId
        }))
    );
    setGroups(groups);

    setFilteredGroups(groups);
  };

  /* =======================
     SAVE
  ======================= */

  const handleSave = async () => {
    try {
      if (type === "CATEGORY") {
        if (!categoryName.trim()) return;
        await apiService.post("/ProductCategory", { categoryName });
        showSuccess("Category saved");
        onSave?.(true);
        return;
      }

      if (type === "GROUP") {
        let hasError = false;

        setRows(prev =>
          prev.map(c => {
            let categoryError = false;

            // CATEGORY validation
            if (!c.categoryId) {
              categoryError = true;
              hasError = true;
            }

            return {
              ...c,
              error: categoryError,   // 🔥 used by Dropdown p-invalid
              groups: c.groups.map(g => {
                if (!g.name.trim()) {
                  hasError = true;
                  return { ...g, error: true };
                }
                return { ...g, error: false };
              })
            };
          })
        );

        if (hasError) {
          showError("Please fix highlighted group names");
          return;
        }

        const payload = rows.flatMap(c =>
          c.groups.map(g => ({
            categoryId: c.categoryId,
            groupName: g.name.trim(),
            isActive: true
          }))
        );

        if (!payload.length) return;

        await apiService.post("/ProductGroup/bulk", payload);
        showSuccess("Groups saved");
        onSave?.(true);
        return;
      }

      if (type === "BRAND") {
        let hasError = false;

        setGroupRows(prev =>
          prev.map(c => {
            const categoryError = !c.categoryId;
            const groupError = !c.groupId;

            if (categoryError || groupError) hasError = true;

            return {
              ...c,
              error: categoryError || groupError,
              brands: c.brands.map(b => {
                const brandError = !b.name.trim();
                if (brandError) hasError = true;
                return { ...b, error: brandError };
              })
            };
          })
        );

        if (hasError) {
          showError("Please select category, group and fill all brand names");
          return;
        }

        const payload = groupRows.flatMap(c =>
          c.brands.map(b => ({
            categoryId: c.categoryId!,
            groupId: c.groupId!,
            brandName: b.name.trim(),
            isActive: true
          }))
        );

        await apiService.post("/ProductBrand/bulk", payload);
        showSuccess("Brands saved");
        onSave?.(true);
      }
    } catch {
      showError("Save failed");
    }
  };

  const legendMap: Record<AddType, string> = {
    CATEGORY: "Add Category",
    GROUP: "Add Group",
    BRAND: "Add Brand"
  };

  const handleCategoryChange = (rowIndex: number, categoryId?: number) => {
    setGroupRows(prev =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        if (!categoryId) {
          return {
            ...row,
            categoryId: undefined,
            groupId: undefined,
            filteredGroups: []
          };
        }

        return {
          ...row,
          categoryId,
          groupId: undefined, // reset selected group
          filteredGroups: groups.filter(g => g.categoryId === categoryId)
        };
      })
    );
  };

  return (
    <fieldset className="border border-gray-300 rounded-md p-3 bg-white">
      <legend className="text-sm font-semibold px-2 text-gray-700">
        {legendMap[type]}
      </legend>

      {/* CATEGORY ONLY */}
      {type === "CATEGORY" && (
        <InputText
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
          className="w-full"
        />
      )}

      {/* GROUP / BRAND */}
      {(type === "GROUP") &&
        rows.map((cat, ci) => (
          <div key={cat.id} className="flex flex-wrap gap-3 p-1">

            <div className="flex-1 min-w-[220px]">
              <strong className="text-sm">Category <span className="mandatory-asterisk">*</span></strong>
              <Dropdown
                value={cat.categoryId}
                options={categories}
                placeholder="Select Category"
                filter
                className={`w-full mb-1 ${cat.error ? "p-invalid" : ""}`}
                onChange={(e) =>
                  setRows(r =>
                    r.map((c, i) =>
                      i === ci
                        ? { ...c, categoryId: e.value, error: false }
                        : c
                    )
                  )
                }
              />
            </div>

            <div className="flex-1 min-w-[220px]">
              <strong className="text-sm ml-4">Group <span className="mandatory-asterisk">*</span></strong>
              {cat.groups.map((grp, gi) => (
                <div key={grp.id} className="ml-2 mb-2 border-l pl-3">

                  <div className="flex gap-2 mb-2">
                    <InputText
                      value={grp.name}
                      placeholder="Group Name"
                      className={`w-full mb-1 ${grp.error ? "p-invalid" : ""}`}
                      onChange={(e) =>
                        setRows(r =>
                          r.map((c, i) =>
                            i === ci
                              ? {
                                ...c,
                                groups: c.groups.map((g, j) =>
                                  j === gi
                                    ? { ...g, name: e.target.value, error: false }
                                    : g
                                )
                              }
                              : c
                          )
                        )
                      }
                    />

                    {gi > 0 &&
                      <Button
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        disabled={cat.groups.length === 1}
                        onClick={() =>
                          setRows(r =>
                            r.map((c, i) =>
                              i === ci
                                ? {
                                  ...c,
                                  groups: c.groups.filter((_, j) => j !== gi)
                                }
                                : c
                            )
                          )
                        }
                        className="p-button-sm custom-xs" data-pr-position="left" tooltip="Delete group name"
                      />
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="min-w-[80px] mt-4">
              <Button icon="pi pi-plus" outlined onClick={() => setRows(r =>
                r.map((c, i) =>
                  i === ci
                    ? { ...c, groups: [...c.groups, emptyGroup()] }
                    : c
                )
              )} className="p-button-sm custom-xs mr-1" data-pr-position="left" tooltip="Add group" />
              {ci > 0 &&
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  disabled={rows.length === 1}
                  onClick={() =>
                    setRows(r => r.filter((_, i) => i !== ci))
                  }
                  className="p-button-sm custom-xs"
                  data-pr-position="left"
                  tooltip="Delete Group"
                />
              }
            </div>
          </div>
        ))}

      {/* ADD CATEGORY */}
      {(type === "GROUP") && (
        <Button
          icon="pi pi-plus"
          label="Add Category"
          onClick={() => setRows(r => [...r, emptyCategory()])}
          className="p-button-sm custom-xs"
        />
      )}

      {(type === "BRAND") &&
        groupRows.map((cat, ci) => (
          <div key={cat.id} className="flex flex-wrap gap-3 p-1">

            <div className="flex-1 min-w-[220px]">
              <strong className="text-sm">Category <span className="mandatory-asterisk">*</span></strong>
              <Dropdown
                value={cat.categoryId}
                options={categories}
                placeholder="Select Category"
                filter
                className={`w-full mb-1 ${cat.error ? "p-invalid" : ""}`}
                onChange={(e) => {
                  setGroupRows(r =>
                    r.map((c, i) =>
                      i === ci
                        ? { ...c, categoryId: e.value, error: false }
                        : c
                    )
                  )
                  handleCategoryChange(ci, e.value)
                }}
              />
            </div>

            <div className="flex-1 min-w-[220px]">
              <strong className="text-sm">Group <span className="mandatory-asterisk">*</span></strong>
              <Dropdown
                value={cat.groupId}
                options={cat.filteredGroups}
                placeholder="Select Category"
                filter
                className={`w-full mb-1 ${cat.error ? "p-invalid" : ""}`}
                onChange={(e) =>
                  setGroupRows(r =>
                    r.map((c, i) =>
                      i === ci
                        ? { ...c, groupId: e.value, error: false }
                        : c
                    )
                  )
                }
              />
            </div>

            <div className="flex-1 min-w-[220px]">
              <strong className="text-sm ml-4">Brand <span className="mandatory-asterisk">*</span></strong>
              {cat.brands.map((grp, gi) => (
                <div key={grp.id} className="ml-2 mb-2 border-l pl-3">

                  <div className="flex gap-2 mb-2">
                    <InputText
                      value={grp.name}
                      placeholder="Brand Name"
                      className={`w-full mb-1 ${grp.error ? "p-invalid" : ""}`}
                      onChange={(e) =>
                        setGroupRows(r =>
                          r.map((c, i) =>
                            i === ci
                              ? {
                                ...c,
                                brands: c.brands.map((g, j) =>
                                  j === gi
                                    ? { ...g, name: e.target.value, error: false }
                                    : g
                                )
                              }
                              : c
                          )
                        )
                      }
                    />

                    {gi > 0 &&
                      <Button
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        disabled={cat.brands.length === 1}
                        onClick={() =>
                          setGroupRows(r =>
                            r.map((c, i) =>
                              i === ci
                                ? {
                                  ...c,
                                  groups: c.brands.filter((_, j) => j !== gi)
                                }
                                : c
                            )
                          )
                        }
                        className="p-button-sm custom-xs" data-pr-position="left" tooltip="Delete brand name"
                      />
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="min-w-[80px] mt-4">
              <Button icon="pi pi-plus" outlined onClick={() => setGroupRows(r =>
                r.map((c, i) =>
                  i === ci
                    ? { ...c, brands: [...c.brands, emptyBrand()] }
                    : c
                )
              )} className="p-button-sm custom-xs mr-1" data-pr-position="left" tooltip="Add Brand" />
              {ci > 0 &&
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  disabled={rows.length === 1}
                  onClick={() =>
                    setGroupRows(r => r.filter((_, i) => i !== ci))
                  }
                  className="p-button-sm custom-xs"
                  data-pr-position="left"
                  tooltip="Delete Brand"
                />
              }
            </div>
          </div>
        ))}

      {(type === "BRAND") && (
        <Button
          icon="pi pi-plus"
          label="Add Brand"
          onClick={() => setGroupRows(r => [...r, emptyGroup()])}
          className="p-button-sm custom-xs"
        />
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 mt-3">
        <Button label="Cancel" outlined severity="danger" onClick={onCancel} className="p-button-sm custom-xs" icon="pi pi-times-circle" style={{ color: 'red' }} />
        <Button label="Save" icon="pi pi-save" severity="success" onClick={handleSave} className="p-button-sm custom-xs" />
      </div>
    </fieldset>
  );
};
