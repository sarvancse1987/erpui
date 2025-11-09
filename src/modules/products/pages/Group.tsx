import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import { TTypedDatatable } from "../../../components/TTypedDatatable";
import { ColumnMeta } from "../../../models/component/ColumnMeta";

interface Group {
    id: string;
    categoryId: string;
    name: string;
    brand: string;
    active: boolean;
}

interface Category {
    id: string;
    name: string;
}

export default function GroupPage() {
    const categories: Category[] = [
        { id: "1", name: "Cement" },
        { id: "2", name: "Steel" },
        { id: "3", name: "Sand" },
    ];

    const [groups] = useState<Group[]>([
        { id: "1", categoryId: "1", name: "Ramco Cement", brand: "Ramco", active: true },
        { id: "2", categoryId: "1", name: "UltraTech Cement", brand: "UltraTech", active: true },
        { id: "3", categoryId: "2", name: "Tata Steel", brand: "Tata", active: true },
        { id: "4", categoryId: "3", name: "River Sand", brand: "Local", active: false },
        { id: "5", categoryId: "1", name: "Chettinad Cement", brand: "Chettinad", active: false },
    ]);

    const [expandedRows, setExpandedRows] = useState<any>(null);

    const columns: ColumnMeta<Group>[] = [
        { field: "id", header: "ID", editable: false, width: "80px" },
        { field: "name", header: "Group Name", editable: true, required: true },
        { field: "brand", header: "Brand", editable: true },
        { field: "active", header: "Active", editable: true, type: "checkbox" },
    ];

    // 🔹 Template for Category Row
    const categoryTemplate = (category: Category) => (
        <div className="flex items-center gap-2">
            <i className="pi pi-folder text-indigo-500" />
            <span className="font-semibold text-gray-700">{category.name}</span>
        </div>
    );

    // 🔹 Template for Expanded Row (Groups per Category)
    const rowExpansionTemplate = (category: Category, activeState: boolean) => {
        const categoryGroups = groups.filter(
            (g) => g.categoryId === category.id && g.active === activeState
        );

        return (
            <div className="p-3 bg-gray-50 border-l-4 border-indigo-400 rounded-md mt-2">
                {categoryGroups.length > 0 ? (
                    <TTypedDatatable<Group>
                        columns={columns}
                        data={categoryGroups}
                        primaryKey="id"
                    />
                ) : (
                    <div className="text-gray-500 italic">No groups found.</div>
                )}
            </div>
        );
    };

    // 🔹 Reusable parent-child table (Active/Inactive)
    const renderTable = (activeState: boolean) => (
        <div className="card border rounded-lg shadow-sm">
            <DataTable
                value={categories}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={(cat) => rowExpansionTemplate(cat, activeState)}
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
