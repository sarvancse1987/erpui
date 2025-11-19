import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import { TTypedDatatable } from "../../../components/TTypedDatatable";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { CategoryModel } from "../../../models/product/CategoryModel";
import { GroupModel } from "../../../models/product/GroupModel";
import { BrandModel } from "../../../models/product/BrandModel";
import apiService from "../../../services/apiService";
import { useToast } from "../../../components/ToastService";

export default function BrandPage() {
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<any>(null);
    const [expandedGroup, setExpandedGroup] = useState<any>(null);
    const { showSuccess, showError } = useToast();

    // 🔹 Fetch hierarchy from backend (category → group → brand)
    const fetchHierarchy = async () => {
        try {
            const response = await apiService.get(
                "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true&includeBrands=true"
            );

            const categoriesData: CategoryModel[] = response.categories ?? [];
            const groupsData: GroupModel[] = response.groups ?? [];
            const brandsData: BrandModel[] = response.brands ?? [];

            // ✅ Build complete hierarchy — even if brand list is empty
            const categoryMap = new Map<number, CategoryModel>();

            for (const c of categoriesData) {
                categoryMap.set(c.categoryId, {
                    ...c,
                    groups: [],
                });
            }

            // --- Attach groups to categories ---
            for (const g of groupsData) {
                const category = categoryMap.get(g.categoryId);
                if (category) {
                    const group: GroupModel = {
                        ...g,
                        brands: [],
                    };
                    category.groups!.push(group);
                }
            }

            // --- Attach brands to groups ---
            for (const b of brandsData) {
                const category = categoryMap.get(b.categoryId);
                const group = category?.groups?.find((g) => g.groupId === b.groupId);
                if (group) {
                    group.brands = group.brands ?? [];
                    group.brands.push(b);
                }
            }

            setCategories(Array.from(categoryMap.values()));
        } catch (error) {
            console.error("❌ Failed to fetch brand hierarchy", error);
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchHierarchy();
    }, []);

    // 🔹 Brand columns
    const brandColumns: ColumnMeta<BrandModel>[] = [
        { field: "brandId", header: "ID", editable: false, width: "80px", hidden: true },
        { field: "brandName", header: "Brand Name", editable: true, required: true },
        { field: "brandDescription", header: "Description", editable: true },
        { field: "isActive", header: "Active", editable: true, type: "checkbox" },
    ];

    // 🔹 UI templates
    const categoryTemplate = (cat: CategoryModel) => (
        <div className="flex items-center gap-2">
            <i className="pi pi-folder text-indigo-500" />
            <span className="font-semibold text-gray-700">{cat.categoryName}</span>
        </div>
    );

    const groupTemplate = (grp: GroupModel) => (
        <div className="flex items-center gap-2">
            <i className="pi pi-layer-group text-blue-500" />
            <span className="font-semibold text-gray-700">{grp.groupName}</span>
        </div>
    );

    // 🔹 Show brands for each group
    const brandExpansionTemplate = (group: GroupModel, activeState: boolean) => {
        const groupBrands = (group.brands ?? []).filter(
            (b) => b.isActive === activeState
        );

        const handleSave = async (updated: BrandModel[]) => {
            try {
                const payload = updated.map((b) => ({
                    ...b,
                    groupId: group.groupId,
                    categoryId: group.categoryId,
                    isActive: b.isActive,
                }));
                await apiService.post("/ProductBrand/bulk", payload);
                await fetchHierarchy();
                showSuccess("Brands saved successfully!");
            } catch (err) {
                console.error("❌ Failed to save brand", err);
                showError("Error saving brands. Please try again.");
            }
        };

        const handleDelete = async (selected: BrandModel[]) => {
            try {
                const updates = selected.map((b) => ({
                    ...b,
                    isActive: false,
                }));
                await apiService.post("/ProductBrand/bulk", updates);
                await fetchHierarchy();
            } catch (err) {
                console.error("❌ Failed to deactivate brands", err);
            }
        };

        return (
            <div className="p-3 bg-gray-50 border-l-4 border-blue-400 rounded-md mt-2">
                <TTypedDatatable<BrandModel>
                    columns={brandColumns}
                    data={groupBrands}
                    primaryKey="brandId"
                    onSave={handleSave}
                    onDelete={handleDelete}
                    isNew={true}
                    isSave={true}
                    isDelete={true}
                />
            </div>
        );
    };

    // 🔹 Show groups for each category
    const groupExpansionTemplate = (category: CategoryModel, activeState: boolean) => {
        const categoryGroups = (category.groups ?? []).filter(
            (g) => g.isActive === activeState || (g.brands ?? []).some((b) => b.isActive === activeState)
        );

        return (
            <div className="p-3 bg-gray-50 border-l-4 border-indigo-400 rounded-md mt-2">
                <DataTable
                    value={categoryGroups}
                    expandedRows={expandedGroup}
                    onRowToggle={(e) => setExpandedGroup(e.data)}
                    rowExpansionTemplate={(grp) => brandExpansionTemplate(grp, activeState)}
                    dataKey="groupId"
                    className="p-datatable-sm"
                    emptyMessage="No groups available in this category"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                >
                    <Column expander style={{ width: "3rem" }} />
                    <Column field="groupName" header="Group" body={groupTemplate} />
                </DataTable>
            </div>
        );
    };

    // 🔹 Render Active / Inactive Tabs
    const renderTable = (activeState: boolean) => {
        // ✅ Include categories with at least one matching group/brand or matching own isActive
        const filteredCategories = categories.filter(
            (c) =>
                c.isActive === activeState ||
                (c.groups ?? []).some(
                    (g) =>
                        g.isActive === activeState ||
                        (g.brands ?? []).some((b) => b.isActive === activeState)
                )
        );

        return (
            <div className="card border rounded-lg shadow-sm h-[calc(100vh-180px)] overflow-auto">
                <DataTable
                    value={filteredCategories}
                    expandedRows={expandedCategory}
                    onRowToggle={(e) => setExpandedCategory(e.data)}
                    rowExpansionTemplate={(cat) => groupExpansionTemplate(cat, activeState)}
                    dataKey="categoryId"
                    className="p-datatable-sm"
                    emptyMessage="No categories found"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                >
                    <Column expander style={{ width: "3rem" }} />
                    <Column field="categoryName" header="Category" body={categoryTemplate} />
                </DataTable>
            </div>
        );
    };

    return (
        <div className="p-2">
            <h2 className="mb-1 text-lg font-semibold">
                🏗️ Product Hierarchy (Category → Group → Brand)
            </h2>

            <TabView>
                <TabPanel
                    header={
                        <div className="flex items-center gap-2" style={{ color: 'green' }}>
                            <i className="pi pi-check-circle" />
                            <span>Active</span>
                        </div>
                    }>
                    {renderTable(true)}
                </TabPanel>

                <TabPanel
                    header={
                        <div className="flex items-center gap-2" style={{ color: 'red' }}>
                            <i className="pi pi-times-circle" />
                            <span>Inactive</span>
                        </div>
                    }>
                    {renderTable(false)}
                </TabPanel>
            </TabView>
        </div>
    );
}
