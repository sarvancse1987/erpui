import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import { TTypedDatatable } from "../../../components/TTypedDatatable";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { GroupModel } from "../../../models/product/GroupModel";
import { CategoryModel } from "../../../models/product/CategoryModel";
import apiService from "../../../services/apiService";


export default function GroupPage() {
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [groups, setGroups] = useState<GroupModel[]>([]);

    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

    const columns: ColumnMeta<GroupModel>[] = [
        { field: "groupId", header: "ID", editable: false, width: "80px", hidden: true },
        { field: "groupName", header: "Group Name", editable: true, required: true },
        { field: "groupDescription", header: "Group Description", editable: true },
        { field: "isActive", header: "Active", editable: true, type: "checkbox" },
    ];

    const fetchCategoriesAndGroups = async () => {
        try {
            const response = await apiService.get(
                "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true"
            );

            const categoriesArray: CategoryModel[] = response.categories ?? [];
            setCategories(categoriesArray);

            setGroups(response.groups ?? []);
        } catch (error) {
            console.error("Failed to fetch categories/groups", error);
            setCategories([]);
            setGroups([]);
        }
    };

    useEffect(() => {
        fetchCategoriesAndGroups();
    }, []);

    // 🔹 Template for Category Row
    const categoryTemplate = (category: CategoryModel) => (
        <div className="flex items-center gap-2">
            <i className="pi pi-folder text-indigo-500" />
            <span className="font-semibold text-gray-700">{category.categoryName}</span>
        </div>
    );

    // 🔹 Template for Expanded Row (Groups per Category)
    const rowExpansionTemplate = (category: CategoryModel, activeState: boolean) => {
        // Filter groups for this category and active state
        const categoryGroups = groups.filter(
            (g) => g.categoryId === category.categoryId && g.isActive === activeState
        );

        const handleSave = async (updatedGroups: GroupModel[]) => {
            const groupsWithCategory = updatedGroups.map((g) => ({
                ...g,
                categoryId: category.categoryId,
                isActive: activeState, // retain tab’s active/inactive context
            }));

            try {
                const response = await apiService.post("/ProductGroup/bulk", groupsWithCategory);
                const savedGroups = response?.data ?? groupsWithCategory;

                setGroups((prev) => {
                    // remove replaced items
                    const updatedIds = new Set(savedGroups.map((g: any) => g.groupId));
                    const others = prev.filter((g: any) => !updatedIds.has(g.groupId));

                    // merge new/updated ones
                    return [...others, ...savedGroups];
                });

                console.log("✅ Saved groups:", savedGroups.map((g: any) => g.groupName).join(", "));
            } catch (error) {
                console.error("❌ Failed to save groups", error);
            }
        };

        // 🔹 Mark selected groups inactive or active
        const handleDelete = async (selectedGroups: GroupModel[]) => {
            if (!selectedGroups || selectedGroups.length === 0) return;

            try {
                // Flip active flag
                const updatedGroups = selectedGroups.map((g) => ({
                    ...g,
                    isActive: !g.isActive, // toggle the flag!
                }));

                const response = await apiService.post("/ProductGroup/bulk", updatedGroups);
                const savedGroups = response?.data ?? updatedGroups;

                setGroups((prev) => {
                    const updatedIds = new Set(savedGroups.map((g: any) => g.groupId));
                    const others = prev.filter((g: any) => !updatedIds.has(g.groupId));
                    return [...others, ...savedGroups];
                });

                console.log(
                    `♻️ ${savedGroups.length} group(s) moved to ${activeState ? "Inactive" : "Active"
                    } tab`
                );
            } catch (error) {
                console.error("❌ Failed to toggle active status", error);
            }
        };

        return (
            <div className="p-3 bg-gray-50 border-l-4 border-indigo-400 rounded-md mt-2">
                <TTypedDatatable<GroupModel>
                    columns={columns}
                    data={categoryGroups.length > 0 ? categoryGroups : []}
                    primaryKey="groupId"
                    onSave={handleSave}
                    onDelete={handleDelete}
                    paginator
                    rows={5} // default rows per page
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </div>
        );
    };

    // 🔹 Reusable parent-child table (Active/Inactive)
    const renderTable = (activeState: boolean) => (
        <div className="card border rounded-lg shadow-sm">
            <DataTable
                value={categories}
                expandedRows={expandedRowKey ? { [expandedRowKey]: true } : {}}
                onRowToggle={(e) => {
                    const toggledKey = Object.keys(e.data)[0];
                    setExpandedRowKey(toggledKey === expandedRowKey ? null : toggledKey);
                }}
                rowExpansionTemplate={(cat) => rowExpansionTemplate(cat, activeState)}
                dataKey="categoryId"
                className="p-datatable-sm"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
            >
                <Column expander style={{ width: "3rem" }} />

                {/* 🧩 Category Name */}
                <Column field="categoryName" header="Category" body={categoryTemplate} />

                {/* 🧩 Group Summary Column */}
                <Column
                    header="Groups"
                    body={(category: CategoryModel) => {
                        const categoryGroups = groups.filter(
                            (g) =>
                                g.categoryId === category.categoryId &&
                                g.isActive === activeState
                        );
                        if (categoryGroups.length === 0)
                            return <span className="text-gray-400 italic">No groups</span>;
                        return (
                            <div className="flex flex-col">
                                {categoryGroups.slice(0, 3).map((g) => (
                                    <span key={g.groupId} className="text-sm text-gray-700">
                                        • {g.groupName}
                                    </span>
                                ))}
                                {categoryGroups.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                        +{categoryGroups.length - 3} more...
                                    </span>
                                )}
                            </div>
                        );
                    }}
                />
            </DataTable>
        </div>
    );

    return (
        <div className="p-3">
            <h2 className="mb-4 text-lg font-semibold">🧩 Group Management - 🏗️ (Category → Group)</h2>
            <TabView>
                {/* ACTIVE TAB */}
                <TabPanel
                    header={
                        <div className="flex items-center gap-2">
                            <i className="pi pi-check-circle text-green-500" />
                            <span className="font-medium">Active</span>
                        </div>
                    }
                >
                    {renderTable(true)}
                </TabPanel>

                {/* INACTIVE TAB */}
                <TabPanel
                    header={
                        <div className="flex items-center gap-2">
                            <i className="pi pi-times-circle text-red-500" />
                            <span className="font-medium">Inactive</span>
                        </div>
                    }
                >
                    {renderTable(false)}
                </TabPanel>
            </TabView>
        </div>
    );
}
