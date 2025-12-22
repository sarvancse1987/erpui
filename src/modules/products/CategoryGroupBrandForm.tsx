import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";

export type AddType = "CATEGORY" | "GROUP" | "BRAND";

interface CategoryGroupBrandFormProps {
  type: AddType;
  editedRow?: any;
  onCancel?: () => void;
  onSave?: (saved: boolean) => void;
}

interface CategoryOnlyRow {
  id: string;
  categoryId?: number;
  name: string;
  error?: boolean;
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
  brandId?: number;
  error?: boolean;
}

interface GroupOption extends Option {
  categoryId: number;
  groupId?: number;
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
  editedRow,
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

  const emptyCategoryOnly = (): CategoryOnlyRow => ({
    id: crypto.randomUUID(),
    name: ""
  });

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
  const [categoryRows, setCategoryRows] = useState<CategoryOnlyRow[]>([
    emptyCategoryOnly()
  ]);

  /* =======================
     LOAD DATA
  ======================= */

  useEffect(() => {
    if (type !== "CATEGORY") {
      loadCategories();
    }
  }, [type]);

  useEffect(() => {
    if (type === "CATEGORY" && editedRow?.length) {
      setCategoryRows(
        editedRow.map((c: any) => ({
          id: crypto.randomUUID(),
          categoryId: c.categoryId,
          name: c.categoryName
        }))
      );
    }

    if (type === "GROUP" && editedRow?.length) {
      setRows(
        editedRow.map((c: any) => ({
          id: crypto.randomUUID(),
          categoryId: c.categoryId,
          groups: c.groups.map((g: any) => ({
            id: crypto.randomUUID(),
            groupId: g.groupId,
            name: g.groupName,
            brands: []
          }))
        }))
      );
    }

    if (type === "BRAND" && editedRow?.length) {
      if (editedRow[0].hasOwnProperty('groups')) {
        setGroupRows(
          editedRow.flatMap((cat: any) =>
            cat.groups.map((grp: any) => ({
              id: crypto.randomUUID(),
              name: grp.groupName,
              categoryId: cat.categoryId,
              groupId: grp.groupId,
              filteredGroups: groups.filter(
                (x) => x.groupId === cat.groupId
              ),
              brands: grp.brands.map((b: any) => ({
                id: crypto.randomUUID(),
                brandId: b.brandId,
                name: b.brandName
              }))
            }))
          )
        );
      } else {
        setGroupRows([{
          id: crypto.randomUUID(),
          name: "",
          categoryId: editedRow[0].categoryId,
          groupId: editedRow[0].groupId,
          brands: editedRow[0].brands.map((b: any) => ({
            id: crypto.randomUUID(),
            brandId: b.brandId,
            name: b.brandName
          }))
        }]);
      }
    }

  }, [type, editedRow]);

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
        const hasError = categoryRows.some(
          r => !r.name || r.name.trim().length === 0
        );

        setCategoryRows(prev =>
          prev.map(r => ({
            ...r,
            error: !r.name || r.name.trim().length === 0
          }))
        );

        if (hasError) {
          showError("Please fill all category names");
          return;
        }

        const payload = categoryRows.map(c => ({
          categoryName: c.name.trim(),
          categoryDescription: c.name.trim(),
          categoryId: c.categoryId ?? 0,
          isActive: true
        }));

        await apiService.post("/ProductCategory/bulk", payload);
        showSuccess("Categories saved");
        onSave?.(true);
        return;
      }

      if (type === "GROUP") {

        // 1️⃣ VALIDATION (pure, sync)
        const hasError =
          rows.some(r => !r.categoryId || r.categoryId === 0) ||
          rows.some(r =>
            r.groups.some(g => !g.name || g.name.trim().length === 0)
          );

        // 2️⃣ UPDATE ERROR FLAGS (UI only)
        setRows(prev =>
          prev.map(c => ({
            ...c,
            error: !c.categoryId || c.categoryId === 0, // category dropdown
            groups: c.groups.map(g => ({
              ...g,
              error: !g.name || g.name.trim().length === 0
            }))
          }))
        );

        if (hasError) {
          showError("Please fix highlighted category / group names");
          return;
        }

        const payload = rows.flatMap(c =>
          c.groups.map(g => ({
            categoryId: c.categoryId,
            groupId: g.groupId ?? 0,
            groupName: g.name.trim(),
            description: g.name.trim(),
            isActive: true
          }))
        );

        if (!payload.length) return;

        await apiService.post("/ProductGroup/bulk", payload);
        showSuccess("Groups saved successfully");
        onSave?.(true);
      }


      if (type === "BRAND") {
        const hasError =
          groupRows.some(c => !c.categoryId || !c.groupId) ||
          groupRows.some(c =>
            c.brands.some(b => !b.name || b.name.trim().length === 0)
          );

        setGroupRows(prev =>
          prev.map(c => ({
            ...c,
            error: !c.categoryId || !c.groupId,
            brands: c.brands.map(b => ({
              ...b,
              error: !b.name || b.name.trim().length === 0
            }))
          }))
        );

        if (hasError) {
          showError("Please select category, group and fill all brand names");
          return;
        }

        const payload = groupRows.flatMap(c =>
          c.brands.map(b => ({
            categoryId: c.categoryId!,
            groupId: c.groupId!,
            brandId: b.brandId ?? 0,
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
      {type === "CATEGORY" &&
        categoryRows.map((cat, ci) => (
          <div key={cat.id} className="flex gap-2 mb-2">

            <InputText
              value={cat.name}
              placeholder="Category Name"
              className={`flex-1 ${cat.error ? "p-invalid" : ""}`}
              onChange={(e) =>
                setCategoryRows(r =>
                  r.map((c, i) =>
                    i === ci ? { ...c, name: e.target.value, error: false } : c
                  )
                )
              }
            />

            {ci > 0 && (
              <Button
                icon="pi pi-trash"
                severity="danger"
                outlined
                className="p-button-sm custom-xs"
                onClick={() =>
                  setCategoryRows(r => r.filter((_, i) => i !== ci))
                }
              />
            )}
          </div>
        ))
      }

      {type === "CATEGORY" && (
        <Button
          icon="pi pi-plus"
          label="Add Category"
          className="p-button-sm custom-xs"
          onClick={() =>
            setCategoryRows(r => [...r, emptyCategoryOnly()])
          }
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
                options={cat.filteredGroups ?? filteredGroups}
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
                        onClick={async () => {
                          setGroupRows(r =>
                            r.map((c, i) =>
                              i === ci
                                ? {
                                  ...c,
                                  groups: c.brands.filter((_, j) => j !== gi)
                                }
                                : c
                            )
                          );
                          const response = await apiService.get(`/ProductBrand/delete/${grp.brandId}`);
                          if (response) {
                            showSuccess("Brand delted successfully");
                          }
                        }}
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
