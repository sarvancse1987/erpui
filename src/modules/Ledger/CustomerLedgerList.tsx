import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { Tag } from "primereact/tag";

export default function CustomerLedgerList() {
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [ledger, setLedger] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load customers
    useEffect(() => {
        loadLedger();
    }, []);

    // Load ledger when customer changes
    useEffect(() => {
        loadLedger();
    }, [customerId]);

    const loadLedger = async () => {
        setLoading(true);
        const url = customerId
            ? `CustomerLedger/ledgerdetails/${customerId}`
            : `CustomerLedger/ledgerdetails`;

        const res = await apiService.get(url);
        setLedger(res.data);

        const customers = Array.from(res.data.values()).map((c: any) => ({
            value: c.customerId,
            label: c.customerName
        }));

        setCustomers(customers);

        setLoading(false);
    };

    const totalDebit = ledger.reduce((sum, x) => sum + x.debit, 0);
    const totalCredit = ledger.reduce((sum, x) => sum + x.credit, 0);
    const closing = ledger.length > 0 ? ledger[ledger.length - 1].closingBalance : 0;

    // Footer Template
    const footerTemplate = () => (
        <div className="flex justify-content-end align-items-center gap-4 py-1 pr-3"
            style={{ lineHeight: "1", minHeight: "30px" }}>

            {/* Total Debit – Red */}
            <div className="flex align-items-center gap-2">
                <span className="font-semibold">Total Debit:</span>
                <span className="px-2 py-1 border-round text-white"
                    style={{ background: "#ef4444", fontSize: "0.8rem" }}>
                    {totalDebit.toFixed(2)}
                </span>
            </div>

            {/* Total Credit – Green */}
            <div className="flex align-items-center gap-2">
                <span className="font-semibold">Total Credit:</span>
                <span className="px-2 py-1 border-round text-white"
                    style={{ background: "#22c55e", fontSize: "0.8rem" }}>
                    {totalCredit.toFixed(2)}
                </span>
            </div>

            {/* Final Balance – Yellow */}
            <div className="flex align-items-center gap-2">
                <span className="font-semibold">Final Balance:</span>
                <span className="px-2 py-1 border-round text-dark"
                    style={{ background: "#facc15", fontSize: "0.8rem" }}>
                    {closing.toFixed(2)}
                </span>
            </div>

        </div>
    );

    const typeTemplate = (rowData: any) => {
        const type = rowData.ledgerType;

        return (
            <Tag
                value={type}
                severity={type === "Dr" ? "danger" : "success"}
                style={{ width: "90px" }}
            />
        );
    };

    const debitTemplate = (row: any) => {
        if (!row.debit) return null;

        return (
            <Tag
                value={row.debit.toFixed(2)}
                severity="danger" 
                style={{ width: "90px", textAlign: "center" }}
            />
        );
    };

    const creditTemplate = (row: any) => {
        if (!row.credit) return null;

        return (
            <Tag
                value={row.credit.toFixed(2)}
                severity="success"
                style={{ width: "90px", textAlign: "center" }}
            />
        );
    };


    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    Customer Ledger Summary
                </legend>

                <div className="flex gap-2 mb-3">
                    <Dropdown
                        value={customerId}
                        options={customers}
                        placeholder="Select Customer"
                        className="w-20rem"
                        onChange={(e) => setCustomerId(e.value)}
                        showClear
                    />
                    <Button
                        label="Refresh"
                        icon="pi pi-refresh"
                        severity="secondary"
                        onClick={loadLedger}
                    />
                </div>

                <DataTable
                    value={ledger}
                    paginator
                    rows={20}
                    loading={loading}
                    className="p-datatable-sm"
                    footer={footerTemplate()}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                >
                    <Column field="customerName" header="Customer Name" />
                    <Column field="lastUpdated" header="Date" />
                    <Column field="lastUpdatedTime" header="Time" />
                    <Column field="ledgerType" header="Type" body={typeTemplate} />
                    <Column field="openingBalance" header="Opening" body={(row) => row.openingBalance?.toFixed(2)} />
                    <Column
                        field="debit"
                        header="Debit"
                        body={debitTemplate}
                    />

                    <Column
                        field="credit"
                        header="Credit"
                        body={(row) => row.credit?.toFixed(2)}
                    />

                    <Column
                        field="closingBalance"
                        header="Closing"
                        body={creditTemplate}
                    />
                </DataTable>
            </fieldset>
        </div>
    );
}
