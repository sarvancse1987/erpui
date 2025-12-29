import React, { useEffect, useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import PurchaseFooterBox from "../modules/purchase/PurchaseFooterBox";
import { Calendar } from "primereact/calendar";
import { parseDDMMYYYY } from "../common/common";

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
    childField: keyof ParentType;
    rowKey: keyof ParentType;
    expandAllInitially?: boolean;
    onEdit?: (row: ParentType) => void;
    sortableColumns?: (keyof ParentType)[];
    page?: string;
    showDateFilter?: boolean;
}

export function ParentChildTable<
    ParentType extends Record<string, any>,
    ChildType extends Record<string, any>
>({
    parentData,
    parentColumns,
    childColumns,
    childField,
    rowKey,
    expandAllInitially = false,
    onEdit,
    sortableColumns = [],
    page,
    showDateFilter
}: ParentChildTableProps<ParentType, ChildType>) {

    const [tableData, setTableData] = useState<any[]>([]);
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
        global: { value: "", matchMode: FilterMatchMode.CONTAINS }
    });
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [isDateFiltered, setIsDateFiltered] = useState(false);

    useEffect(() => {
        setTableData(parentData);
        setOriginalData(parentData)
    }, [parentData]);


    const expandAll = () => {
        const all: Record<string, boolean> = {};
        parentData.forEach((p) => (all[p[rowKey]] = true));
        setExpandedRows(all);
    };

    const collapseAll = () => setExpandedRows(null);

    const rowExpansionTemplate = (parent: ParentType) => {
        const children: ChildType[] = parent[childField] || [];

        const freightAmount = parent.freightAmount ?? 0;
        const roundOff = parent.roundOff ?? 0;
        const brokarageAmount = parent.brokerageAmount ?? 0;
        const showFooter = freightAmount !== 0 || roundOff !== 0 || brokarageAmount !== 0;

        const footerTemplate = showFooter ? (
            <div className="flex justify-content-end gap-1 font-bold pr-2 py-1">
                {freightAmount !== 0 && (
                    <span>
                        Freight Charge: <span style={{ backgroundColor: "#12b63b", color: "white", padding: "2px 6px", borderRadius: "4px" }}>₹{freightAmount.toFixed(2)}</span>

                    </span>
                )}
                {roundOff !== 0 && (
                    <span>
                        Round Off:{" "}
                        <span
                            style={{
                                backgroundColor: roundOff > 0 ? "#12b63b" : "#b63312ff",
                                color: "white",
                                fontWeight: "bold",
                                padding: "2px 6px",
                                borderRadius: "4px"
                            }}
                        >
                            ₹{roundOff.toFixed(2)}
                        </span>
                    </span>
                )}

                {brokarageAmount !== 0 && (
                    <span>
                        Brokarage:{" "}
                        <span
                            style={{
                                backgroundColor: brokarageAmount > 0 ? "green" : "red",
                                color: "white",
                                fontWeight: "bold",
                                padding: "2px 6px",
                                borderRadius: "4px"
                            }}
                        >
                            ₹{brokarageAmount.toFixed(2)}
                        </span>
                    </span>
                )}
            </div>
        ) : null;

        return (
            <div className="p-3">
                <DataTable value={children} footer={footerTemplate}>
                    {childColumns.map((col, idx) => (
                        <Column
                            key={idx}
                            field={col.field as string}
                            header={col.header}
                            body={col.body}
                            style={{ width: col.width }}
                        />
                    ))}
                </DataTable>
            </div>
        );
    };

    const totals = useMemo(() => {
        return parentData.reduce(
            (acc, row) => {
                const invoice = row.invoiceAmount ?? 0;
                const cash = row.cash ?? 0;
                const upi = row.upi ?? 0;
                const paid = cash + upi;
                const balance = invoice - paid;

                acc.invoiceAmount += invoice;
                acc.paidAmount += paid;
                acc.balanceAmount += balance;
                acc.runningAmount += row.runningBalance ?? 0;
                acc.gstAmount += row.totalGST ?? 0;
                acc.grandTotal += row.grandTotal ?? 0;

                return acc;
            },
            {
                invoiceAmount: 0,
                paidAmount: 0,
                balanceAmount: 0,
                runningAmount: 0,
                gstAmount: 0,
                grandTotal: 0
            }
        );
    }, [parentData]);

    const saleTotals = useMemo(() => {
        return parentData.reduce(
            (acc, row: any) => {
                const cash = row.cash ?? 0;
                const upi = row.upi ?? 0;
                const paid = cash + upi;

                acc.grandTotal += row.grandTotal ?? 0;
                acc.paidAmount += paid;
                acc.balanceAmount += row.balanceAmount ?? 0;
                acc.runningAmount += row.runningBalance ?? 0;

                return acc;
            },
            {
                grandTotal: 0,
                paidAmount: 0,
                balanceAmount: 0,
                runningAmount: 0,
            }
        );
    }, [parentData]);

    const formatINR = (value: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }).format(value);

    const tableFooter =
        page === "purchase" ? (
            <div className="custom-footer flex justify-between items-center gap-1 flex-wrap px-2 py-1">
                <div className="flex items-center gap-1 flex-wrap">

                    {/* Paid Amount */}
                    <PurchaseFooterBox
                        label="Paid Amt"
                        value={formatINR(totals.paidAmount)}
                        bg="#22c55e"
                    />

                    {/* Balance Amount */}
                    <PurchaseFooterBox
                        label="Balance Amt"
                        value={formatINR(totals.balanceAmount)}
                        bg="#be5744ff"
                    />

                    {/* GST Amount */}
                    <PurchaseFooterBox
                        label="GST Amt"
                        value={formatINR(totals.gstAmount)}
                        bg="#d3db34ff"
                    />

                    {/* Grand Total */}
                    <PurchaseFooterBox
                        label="Grand Total"
                        value={formatINR(totals.grandTotal)}
                    />

                </div>
            </div>
        ) : page === "sale" ? (
            <div className="custom-footer flex justify-between items-center gap-1 flex-wrap px-2 py-1">
                <div className="flex items-center gap-1 flex-wrap">
                    <PurchaseFooterBox label="Total Sale" value={formatINR(saleTotals.grandTotal)} />
                    <PurchaseFooterBox label="Paid Amt" value={formatINR(saleTotals.paidAmount)} bg="#22c55e" />
                    <PurchaseFooterBox label="Balance Amt" value={formatINR(saleTotals.runningAmount)} bg="#be5744ff" />
                </div>
            </div>
        ): page === "quotation" ? (
            <div className="custom-footer flex justify-between items-center gap-1 flex-wrap px-2 py-1">
                <div className="flex items-center gap-1 flex-wrap">
                    <PurchaseFooterBox label="Total" value={formatINR(saleTotals.grandTotal)} />
                </div>
            </div>
        ) : null;

    const handleDateSubmit = () => {
        if (!fromDate || !toDate) return;

        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        // decide date field based on page
        const getDateField = (row: any) => {
            if (page === "purchase") return row.invoiceDate;
            if (page === "sale") return row.saleOnDate;
            return null;
        };

        const filtered = originalData.filter((row: any) => {
            const dateValue = getDateField(row);
            if (!dateValue) return false;

            const rowDate = parseDDMMYYYY(dateValue);
            if (!rowDate) return false;

            return rowDate >= from && rowDate <= to;
        });

        setTableData(filtered);
        setIsDateFiltered(true);
    };

    const handleClearFilter = () => {
        if (isDateFiltered) {
            setFromDate(null);
            setToDate(null);
            setTableData(originalData);
            setIsDateFiltered(false);
        }
    }

    return (
        <div className="card">
            {/* Toolbar */}
            <div className="flex justify-content-end gap-2 mb-2">
                {/* <Button icon="pi pi-plus" label="Expand All" onClick={expandAll} text />
                <Button icon="pi pi-minus" label="Collapse All" onClick={collapseAll} text /> */}

                {showDateFilter && (
                    <>
                        <div className="ml-auto">
                            <div className="flex items-end gap-2 mb-3 flex-wrap">
                                <div className="flex flex-col">
                                    <Calendar
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.value ?? null)}
                                        dateFormat="yy-mm-dd"
                                        showIcon
                                        className="w-40"
                                        placeholder="From date"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <Calendar
                                        value={toDate}
                                        onChange={(e) => setToDate(e.value ?? null)}
                                        dateFormat="yy-mm-dd"
                                        showIcon
                                        className="w-40"
                                        minDate={fromDate ?? undefined}
                                        placeholder="To date"
                                    />
                                </div>

                                <Button
                                    icon={"pi pi-check"}
                                    size="small"
                                    disabled={!isDateFiltered && (!fromDate || !toDate)}
                                    onClick={handleDateSubmit}
                                    className="h-[38px]"
                                />
                                {isDateFiltered && (
                                    <Button
                                        icon={"pi pi-times"}
                                        size="small"
                                        disabled={!isDateFiltered && (!fromDate || !toDate)}
                                        onClick={handleClearFilter}
                                        className="h-[38px]"
                                        severity={"danger"}
                                    />
                                )}
                            </div>
                        </div>

                        <span className="p-input-icon-left relative w-64 ml-2">
                            <IconField iconPosition="left">
                                <InputIcon className="pi pi-search" />
                                <InputText
                                    value={globalFilter}
                                    onChange={(e) => {
                                        setGlobalFilter(e.target.value);
                                        setFilters((prev: any) => ({
                                            ...prev,
                                            global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
                                        }));
                                    }}
                                    placeholder="Search"
                                />
                            </IconField>
                        </span>
                    </>
                )}

                {!showDateFilter && (
                    <div className="ml-auto">
                        <span className="p-input-icon-left relative w-64 ml-2">
                            <IconField iconPosition="left">
                                <InputIcon className="pi pi-search" />
                                <InputText
                                    value={globalFilter}
                                    onChange={(e) => {
                                        setGlobalFilter(e.target.value);
                                        setFilters((prev: any) => ({
                                            ...prev,
                                            global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
                                        }));
                                    }}
                                    placeholder="Search"
                                />
                            </IconField>
                        </span>
                    </div>
                )}

            </div>

            {/* Parent table */}
            <DataTable
                scrollHeight="300px"
                value={tableData}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                filters={filters}
                globalFilterFields={parentColumns.map((c) => c.field as string)}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey={rowKey as string}
                rowClassName={(rowData) =>
                    expandedRows && expandedRows[rowData[rowKey]]
                        ? "expanded-parent-row"
                        : ""
                }
                size="small"
                scrollable
                style={{ width: "100%" }}
                footer={tableFooter}
            >
                <Column expander style={{ width: "3rem" }} />

                {parentColumns.map((col, idx) => {
                    const isSortable = sortableColumns.includes(col.field as keyof ParentType);

                    return (
                        <Column
                            key={idx}
                            field={col.field as string}
                            header={col.header}
                            body={col.body}
                            sortable={isSortable}
                            sortField={isSortable ? (col.field as string) : undefined}
                            style={{ width: col.width }}
                        />
                    );
                })}

                {onEdit && (
                    <Column
                        key="edit"
                        header=""
                        body={(rowData: ParentType) => (
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-sm p-button-rounded p-button-outlined p-button-info"
                                style={{ width: "25px", height: "25px", padding: "0" }}
                                onClick={() => onEdit(rowData)}
                            />
                        )}
                        style={{ width: "3rem", textAlign: "center" }}
                    />
                )}
            </DataTable>
        </div>
    );
}
