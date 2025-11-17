import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";

interface ColumnMeta<T> {
    field?: keyof T;
    header: string;
    body?: (row: T) => React.ReactNode;
    width?: string;
}

interface ParentChildTableProps<ParentType, ChildType> {
    parentData: ParentType[];
    parentColumns: ColumnMeta<ParentType>[];
    childColumns: ColumnMeta<ChildType>[];
    childField: keyof ParentType; // the property in parent that holds child array
    rowKey: keyof ParentType;
    expandAllInitially?: boolean;
    onEdit?: (row: ParentType) => void;
}

export function ParentChildTable<ParentType extends Record<string, any>, ChildType extends Record<string, any>>({
    parentData,
    parentColumns,
    childColumns,
    childField,
    rowKey,
    expandAllInitially = false,
    onEdit,
}: ParentChildTableProps<ParentType, ChildType>) {
    const [expandedRows, setExpandedRows] = useState<any>(
        expandAllInitially
            ? parentData.reduce((acc, curr) => {
                acc[curr[rowKey]] = true;
                return acc;
            }, {} as Record<string, boolean>)
            : null
    );

    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<any>({
        global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    });

    const expandAll = () => {
        const all: Record<string, boolean> = {};
        parentData.forEach((p) => (all[p[rowKey]] = true));
        setExpandedRows(all);
    };

    const collapseAll = () => setExpandedRows(null);

    const rowExpansionTemplate = (parent: ParentType) => {
        const children: ChildType[] = parent[childField] || [];
        return (
            <div className="p-3">
                <DataTable value={children}>
                    {childColumns.map((col, idx) => (
                        <Column key={idx} field={col.field as string} header={col.header} body={col.body} style={{ width: col.width }} />
                    ))}
                </DataTable>
            </div>
        );
    };

    return (
        <div className="card">
            <div className="flex justify-content-end gap-2 mb-2">
                <Button icon="pi pi-plus" label="Expand All" onClick={expandAll} text />
                <Button icon="pi pi-minus" label="Collapse All" onClick={collapseAll} text />

                <div className="ml-auto">
                    <span className="p-input-icon-left relative w-64">
                        <IconField iconPosition="left">
                            <InputIcon className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setGlobalFilter(value);
                                    setFilters({
                                        ...filters,
                                        global: { value, matchMode: FilterMatchMode.CONTAINS },
                                    });
                                }}
                                placeholder="Search"
                            />
                        </IconField>
                    </span>
                </div>
            </div>
            <DataTable
                value={parentData}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                filters={filters}
                globalFilterFields={parentColumns.map((c) => c.field as string)}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey={rowKey as string}
                rowClassName={(rowData) => {
                    return expandedRows && expandedRows[rowData[rowKey]]
                        ? "expanded-parent-row"
                        : "";
                }}
            >
                <Column expander style={{ width: "3rem" }} />
                {parentColumns.map((col, idx) => (
                    <Column key={idx} field={col.field as string} header={col.header} body={col.body} style={{ width: col.width }} />
                ))}
                {onEdit && (
                    <Column
                        key="edit"
                        header=""
                        body={(rowData: ParentType) => (
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-sm p-button-rounded p-button-outlined p-button-info"
                                style={{ width: '25px', height: '25px', padding: '0' }}
                                onClick={() => onEdit(rowData)}
                            />
                        )}
                        style={{ width: "3rem", textAlign: "center" }}
                        frozen={false} // optional: can make it frozen if needed
                    />
                )}

            </DataTable>
        </div>
    );
}
