import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import { TTypedDatatable } from "../../../components/TTypedDatatable";
import { ColumnMeta } from "../../../models/component/ColumnMeta";

interface Category {
    id: string;
    name: string;
}

interface Group {
    id: string;
    categoryId: string;
    name: string;
    active: boolean;
}

interface Brand {
    id: string;
    groupId: string;
    name: string;
    active: boolean;
}

export default function BrandHierarchyPage() {
    const [expandedCategory, setExpandedCategory] = useState<any>(null);
    const [expandedGroup, setExpandedGroup] = useState<any>(null);

    // 1️⃣ Category data
    const categories: Category[] = [
        { id: "1", name: "Cement" },
        { id: "2", name: "Steel" },
    ];

    // 2️⃣ Group data
    const groups: Group[] = [
        { id: "1", categoryId: "1", name: "Ramco Cement", active: true },
        { id: "2", categoryId: "1", name: "UltraTech Cement", active: true },
        { id: "3", categoryId: "2", name: "Tata Steel", active: true },
        { id: "4", categoryId: "2", name: "JSW Steel", active: false },
    ];

    // 3️⃣ Brand data
    const brands: Brand[] = [
        { id: "1", groupId: "1", name: "Ramco", active: true },
        { id: "2", groupId: "1", name: "Ramco White", active: true },
        { id: "3", groupId: "2", name: "UltraTech", active: true },
        { id: "4", groupId: "3", name: "Tata", active: true },
        { id: "5", groupId: "4", name: "JSW", active: false },
    ];

    // 🔹 Brand columns
    const brandColumns: ColumnMeta<Brand>[] = [
        { field: "id", header: "ID", editable: false, width: "80px" },
        { field: "name", header: "Brand Name", editable: true, required: true },
        { field: "active", header: "Active", editable: true, type: "checkbox" },
    ];

    // 🔹 Group columns
    const groupColumns: ColumnMeta<Group>[] = [
        { field: "id", header: "ID", editable: false, width: "80px" },
        { field: "name", header: "Group Name", editable: true, required: true },
        { field: "active", header: "Active", editable: true, type: "checkbox" },
    ];

    // 🔹 Category display
    const categoryTemplate = (category: Category) => (
        <div className="flex items-center gap-2">
            <i className="pi pi-folder text-indigo-500" />
            <span className="font-semibold text-gray-700">{category.name}</span>
        </div>
    );

    // 🔹 Group display
    const groupTemplate = (group: Group) => (
        <div className="flex items-center gap-2">
            <i className="pi pi-layer-group text-blue-500" />
            <span className="font-semibold text-gray-700">{group.name}</span>
        </div>
    );

    // 🔹 Inner expansion for brands under a group
    const brandExpansionTemplate = (group: Group, activeState: boolean) => {
        const groupBrands = brands.filter(
            (b) => b.groupId === group.id && b.active === activeState
        );

        return (
            <div className="p-3 bg-gray-50 border-l-4 border-blue-400 rounded-md mt-2">
                {groupBrands.length > 0 ? (
                    <TTypedDatatable<Brand>
                        columns={brandColumns}
                        data={groupBrands}
                        primaryKey="id"
                    />
                ) : (
                    <div className="text-gray-500 italic">No brands found.</div>
                )}
            </div>
        );
    };

    // 🔹 Expansion for groups under category
    const groupExpansionTemplate = (category: Category, activeState: boolean) => {
        const categoryGroups = groups.filter(
            (g) => g.categoryId === category.id && g.active === activeState
        );

        return (
            <div className="p-3 bg-gray-50 border-l-4 border-indigo-400 rounded-md mt-2">
                {categoryGroups.length > 0 ? (
                    <DataTable
                        value={categoryGroups}
                        expandedRows={expandedGroup}
                        onRowToggle={(e) => setExpandedGroup(e.data)}
                        rowExpansionTemplate={(grp) =>
                            brandExpansionTemplate(grp, activeState)
                        }
                        dataKey="id"
                        className="p-datatable-sm"
                    >
                        <Column expander style={{ width: "3rem" }} />
                        <Column field="name" header="Group" body={groupTemplate} />
                    </DataTable>
                ) : (
                    <div className="text-gray-500 italic">No groups found.</div>
                )}
            </div>
        );
    };

    // 🔹 Render full hierarchy (Category → Group → Brand)
    const renderTable = (activeState: boolean) => (
        <div className="card border rounded-lg shadow-sm">
            <DataTable
                value={categories}
                expandedRows={expandedCategory}
                onRowToggle={(e) => setExpandedCategory(e.data)}
                rowExpansionTemplate={(cat) => groupExpansionTemplate(cat, activeState)}
                dataKey="id"
                className="p-datatable-sm"
            >
                <Column expander style={{ width: "3rem" }} />
                <Column field="name" header="Category" body={categoryTemplate} />
            </DataTable>
        </div>
    );

    return (
        <div className="p-3">
            <h2 className="mb-4 text-lg font-semibold">🏗️ Product Hierarchy (Category → Group → Brand)</h2>

            <TabView>
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
