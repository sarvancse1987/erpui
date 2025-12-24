import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { Tag } from "primereact/tag";
import PurchaseFooterBox from "../purchase/PurchaseFooterBox";
import { formatINR } from "../../common/common";

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

        const customers = Array.from(res.data.values())
            .reduce((map: Map<number, any>, c: any) => {
                if (!map.has(c.customerId)) {
                    map.set(c.customerId, {
                        value: c.customerId,
                        label: c.customerName
                    });
                }
                return map;
            }, new Map())
            .values();

        setCustomers(Array.from(customers));

        setLoading(false);
    };

    const totalDebit = ledger.reduce((sum, x) => sum + x.debit + x.credit, 0);
    const totalCredit = ledger.reduce((sum, x) => sum + x.credit, 0);
    const closing = ledger.reduce((sum, x) => sum + x.debit, 0);

    // Footer Template
    const footerTemplate = () => (
        <div className="flex justify-content-end align-items-center gap-4 py-1 pr-3"
            style={{ lineHeight: "1", minHeight: "30px" }}>

            <PurchaseFooterBox
                label="Total Sale"
                value={formatINR(totalDebit)}
                bg="#0ea5e9"
            />

            <PurchaseFooterBox
                label="Total Received"
                value={formatINR(totalCredit)}
                bg="#22c55e"
            />

             <PurchaseFooterBox
                label="Total Balance"
                value={formatINR(closing)}
                bg="#ef4444"
            />

        </div>
    );

    const openingBalanceTemplate = (row: any) => {
        const value = row.openingBalance ?? 0;

        return (
            <Tag
                value={value.toFixed(2)}
                severity={value === 0 ? "success" : "danger"}
                style={{ width: "90px", textAlign: "center" }}
            />
        );
    };

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

    const balanceTemplate = (row: any) => {
        if (!row.closingBalance) return null;

        return (
            <Tag
                value={row.closingBalance.toFixed(2)}
                severity="danger"
                style={{ width: "90px", textAlign: "center" }}
            />
        );
    };

    const paidTemplate = (row: any) => {
        return (
            <Tag
                value={row.credit.toFixed(2)}
                severity="success"
                style={{ width: "90px", textAlign: "center" }}
            />
        );
    };

    const totalTemplate = (row: any) => {
        const total = (row.credit ?? 0) + (row.debit ?? 0);
        return (
            <Tag
                value={total.toFixed(2)}
                severity="info"
                style={{ width: "90px", textAlign: "center" }}
            />
        );
    };


    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-2">🧾 Ledger Management</h2>

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
                        icon="pi pi-refresh"
                        severity="secondary"
                        onClick={loadLedger}
                    />
                </div>

                <DataTable
                    value={ledger}
                    dataKey="customerLedgerId"
                    scrollable
                    scrollHeight="300px"
                    size="normal"
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
                    <Column field="openingBalance" header="Opening Bal" body={openingBalanceTemplate} />
                    <Column field="openingBalance" header="Total" body={totalTemplate} />
                    <Column
                        field="credit"
                        header="Credit"
                        body={paidTemplate}
                    />
                    <Column
                        field="debit"
                        header="Debit"
                        body={debitTemplate}
                    />

                    <Column
                        field="closingBalance"
                        header="Closing Bal."
                        body={balanceTemplate}
                    />
                </DataTable>
            </fieldset>
        </div>
    );
}
