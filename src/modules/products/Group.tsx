import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import { TTypedDatatable } from "../../components/TTypedDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { GroupModel } from "../../models/product/GroupModel";
import { CategoryModel } from "../../models/product/CategoryModel";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { CategoryGroupBrandForm } from "./CategoryGroupBrandForm";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";


export default function GroupPage() {
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [groups, setGroups] = useState<GroupModel[]>([]);

    const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);
    const [editedRows, setEditedRows] = useState<any[]>([]);
    const { showSuccess, showError } = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<any>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const columns: ColumnMeta<GroupModel>[] = [
        { field: "groupId", header: "ID", editable: false, width: "80px", hidden: true },
        { field: "groupName", header: "Group Name", editable: true, required: true, placeholder: "Group name" },
        { field: "groupDescription", header: "Group Description", editable: true, placeholder: "Description" },
        { field: "isActive", header: "Active", editable: true, type: "checkbox" },
    ];

    const fetchCategoriesAndGroups = async () => {
        try {
            const response = await apiService.get("/ProductCategory/hierarchy?includeCategories=true&includeGroups=true");
            setCategories(response.categories ?? []);
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

    useEffect(() => {
        if (!globalFilter) {
            setExpandedRowKey(null);
            return;
        }

        const matched = getCategoriesWithGroupNames(true).find(cat =>
            cat.groupNames?.toLowerCase().includes(globalFilter.toLowerCase())
        );

        if (matched) {
            setExpandedRowKey(matched.categoryId.toString());
        }
    }, [globalFilter]);

    // 🔹 Template for Category Row
    const categoryTemplate = (category: CategoryModel) => (
        <div className="flex items-center gap-2">
            <i className="pi pi-folder text-indigo-500" />
            <span className="font-semibold text-gray-700">{category.categoryName}</span>
        </div>
    );

    const editRows = (rowData: any) => {
        const rows = groups.filter(item => item.categoryId == rowData.categoryId);
        if (rows.length > 0) {
            const editedRows = {
                categoryId: rows[0].categoryId,
                groups: rows
            }
            setEditedRows([editedRows]);
        } else {
            const editedRows = {
                categoryId: rowData.categoryId,
                groups: [{
                    groupId: 0,
                    name: "",
                    brands: []
                }]
            }
            setEditedRows([editedRows]);
        }
        setSidebarVisible(true);
    }

    const actionBodyTemplate = (rowData: any) => (
        <Button
            icon="pi pi-pencil"
            className="p-button-sm p-button-rounded p-button-outlined p-button-info"
            style={{ width: "25px", height: "25px", padding: "0" }}
            onClick={() => { editRows(rowData) }}
        />
    );

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

                showSuccess("Groups saved successfully!");
            } catch (error) {
                console.error("❌ Failed to save groups", error);
                showError("Error saving groups. Please try again.");
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
                showSuccess("Group deleted successfully!");
            } catch (error) {
                console.error("❌ Failed to toggle active status", error);
                showError("Error delete groups. Please try again.");
            }
        };

        const onEdit = (row: any) => {
            const editRow = {
                categoryId: row.categoryId,
                groups: [{
                    groupId: row.groupId,
                    groupName: row.groupName,
                    brands: []
                }]
            }
            setEditedRows([editRow]);
            setSidebarVisible(true);
        }


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
                    isNew={false}
                    isEdit={true}
                    isSave={true}
                    isDelete={true}
                    isSearch={false}
                    sortableColumns={['groupName']}
                    onEdit={onEdit}
                />
            </div>
        );
    };

    const getCategoriesWithGroupNames = (activeState: boolean) => {
        return categories.filter(item => item.isActive == activeState).map((cat) => {
            const groupNames = groups
                .filter((g) =>
                    g.categoryId === cat.categoryId &&
                    g.isActive === activeState
                )
                .map((g) => g.groupName)
                .join(" ");

            return {
                ...cat,
                groupNames
            };
        });
    };

    const renderTable = (activeState: boolean) => {
        const categoriesWithGroupNames = getCategoriesWithGroupNames(activeState);
        return (<DataTable
            value={categoriesWithGroupNames}
            filters={filters}
            globalFilterFields={["categoryName", "groupNames"]}
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
            size="small"
            scrollable
            style={{ width: "100%" }}
            rowClassName={(rowData, rowIndex: any) =>
                rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
            }
        >
            <Column expander style={{ width: "3rem" }} />

            <Column field="categoryName" header="Category" body={categoryTemplate} />

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
            <Column body={actionBodyTemplate} header="Actions" style={{ width: "100px" }} frozen={true} />
        </DataTable>
        )
    }

    const add = () => {
        setSidebarVisible(true);
    }

    const onCancel = () => {
        setSidebarVisible(false);
    }

    const onSave = () => {
        fetchCategoriesAndGroups();
        setSidebarVisible(false);
    }

    return (
        <div className="p-2">
            <h2 className="mb-1 text-lg font-semibold">🧩 Group Management - 🏗️ (Category → Group)</h2>
            <TabView>
                <TabPanel
                    header={
                        <div className="flex items-center gap-2" style={{ color: 'green' }}>
                            <i className="pi pi-check-circle" />
                            <span>Active</span>
                        </div>
                    }>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex gap-2 mb-2">
                            <Button label="Add" icon="pi pi-plus" outlined onClick={add} size="small" className="p-button-sm custom-xs" />
                        </div>
                        <div className="ml-auto">
                            <span className="p-input-icon-left relative w-64">
                                <IconField iconPosition="left">
                                    <InputIcon className="pi pi-search" />
                                    <InputText value={globalFilter} onChange={(e) => {
                                        const value = e.target.value;
                                        setGlobalFilter(value);
                                        setFilters({
                                            global: { value, matchMode: FilterMatchMode.CONTAINS }
                                        });
                                    }} placeholder="Search" />
                                </IconField>
                            </span>
                        </div>
                    </div>
                    {renderTable(true)}
                </TabPanel>

                <TabPanel
                    header={
                        <div className="flex items-center gap-2" style={{ color: 'red' }}>
                            <i className="pi pi-times-circle" />
                            <span>Inactive</span>
                        </div>
                    }
                >
                    {renderTable(false)}
                </TabPanel>
            </TabView>

            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                style={{ width: '55rem', height: '100%' }}
                showCloseIcon={true}
                header="Add Group"
            >
                <CategoryGroupBrandForm type="GROUP" onCancel={onCancel} onSave={onSave} editedRow={editedRows} />
            </Sidebar>
        </div>
    );
}
