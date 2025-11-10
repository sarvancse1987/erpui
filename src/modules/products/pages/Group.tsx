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

    const fetchCategories = async () => {
        try {
            const response = await apiService.get(
                "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true"
            );
            const categoriesArray: CategoryModel[] = response.categories ?? [];

            setCategories(categoriesArray);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchCategories();
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

        // Callback to handle save (new or edited group)
        const handleSave = (updatedGroups: GroupModel[]) => {
            // Set categoryId for new groups if not already set
            const groupsWithCategory = updatedGroups.map((g) => ({
                ...g,
                categoryId: category.categoryId,
            }));

            // Merge with existing groups
            setGroups((prev) => {
                const others = prev.filter(
                    (g) => g.categoryId !== category.categoryId || g.isActive !== activeState
                );
                return [...others, ...groupsWithCategory];
            });
        };

        return (
            <div className="p-3 bg-gray-50 border-l-4 border-indigo-400 rounded-md mt-2">
                <TTypedDatatable<GroupModel>
                    columns={columns}
                    data={categoryGroups.length > 0 ? categoryGroups : []}
                    primaryKey="groupId"
                    onSave={handleSave}
                />
            </div>
        );
    };

    const saveGroupsToServer = async (groupsToSave: GroupModel[]) => {
        try {
            // Save new/edited groups
            await apiService.post("/ProductGroup/save", groupsToSave);

            // After saving, fetch updated categories + groups
            await fetchCategoriesAndGroups();

        } catch (error) {
            console.error("Failed to save groups", error);
        }
    };

    const fetchCategoriesAndGroups = async () => {
        try {
            const response = await apiService.get(
                "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true"
            );

            const categoriesArray: CategoryModel[] = response.categories ?? [];
            setCategories(categoriesArray);

            const allGroups: GroupModel[] = categoriesArray
                .flatMap(c => (c.groups ?? []).map(g => ({
                    ...g,
                    categoryName: c.categoryName,
                    categoryDescription: c.categoryDescription,
                })));

            setGroups(allGroups);
        } catch (error) {
            console.error("Failed to fetch categories/groups", error);
            setCategories([]);
            setGroups([]);
        }
    };

    // 🔹 Reusable parent-child table (Active/Inactive)
    const renderTable = (activeState: boolean) => (
        <div className="card border rounded-lg shadow-sm">
            <DataTable
                value={categories}
                expandedRows={expandedRowKey ? { [expandedRowKey]: true } : {}}
                onRowToggle={(e) => {
                    // Only allow one row expanded at a time
                    const toggledKey = Object.keys(e.data)[0];
                    setExpandedRowKey(toggledKey === expandedRowKey ? null : toggledKey);
                }}
                rowExpansionTemplate={(cat) => rowExpansionTemplate(cat, activeState)}
                dataKey="categoryId" // Make sure this matches CategoryModel
                className="p-datatable-sm"
            >
                <Column expander style={{ width: "3rem" }} />
                <Column field="categoryName" header="Category" body={categoryTemplate} />
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
