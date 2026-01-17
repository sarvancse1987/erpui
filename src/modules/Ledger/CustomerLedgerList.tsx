import React, { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { Tag } from "primereact/tag";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypeFooterDatatable } from "../../components/TTypeFooterDatatable";

export default function CustomerLedgerList() {
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [ledger, setLedger] = useState<any[]>([]);
    const [ledgerFooter, setLedgerFooter] = useState<any>(null);

    // Load customers
    useEffect(() => {
        loadLedger();
    }, []);

    // Load ledger when customer changes
    useEffect(() => {
        loadLedger();
    }, [customerId]);

    const loadLedger = async () => {
        const url = customerId
            ? `CustomerLedger/ledgerdetails/${customerId}`
            : `CustomerLedger/ledgerdetails`;

        const res = await apiService.get(url);
        setLedger(res.data);

        setLedgerFooter(res.ledgerFooterResult ?? null);

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
    };

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
        if (row.closingBalance === null || row.closingBalance === undefined) {
            return null;
        }

        const isZero = row.closingBalance === 0;

        return (
            <Tag
                value={row.closingBalance.toFixed(2)}
                severity={isZero ? "success" : "danger"}
                style={{ width: "90px", textAlign: "center", backgroundColor: isZero ? "#22c55e" : "#ef4444" }}

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

    const sourcetypeTemplate = (row: any) => (
        <Tag
            value={row.sourceType}
            severity="success"
            style={{ width: "70px", textAlign: "center" }}
        />
    );

    const ledgerColumns: ColumnMeta<any>[] = [
        {
            field: "customerName",
            header: "Customer Name",
            editable: false,
        },
        {
            field: "lastUpdated",
            header: "Date",
            editable: false,
        },
        {
            field: "lastUpdatedTime",
            header: "Time",
            editable: false,
        },
        {
            field: "sourceType",
            header: "Source Type",
            width: "120px",
            body: sourcetypeTemplate,
            exportValue: (row) => row.sourceType,
        },
        {
            field: "ledgerType",
            header: "Type",
            editable: false,
            body: typeTemplate,
        },
        {
            field: "openingBalance",
            header: "Opening Bal",
            editable: false,
            body: openingBalanceTemplate,
        },
        {
            field: "openingBalance",
            header: "Received Amt",
            editable: false,
            body: totalTemplate,
        },
        {
            field: "credit",
            header: "Credit",
            editable: false,
            body: paidTemplate,
        },
        {
            field: "debit",
            header: "Debit",
            editable: false,
            body: debitTemplate,
        },
        {
            field: "closingBalance",
            header: "Closing Bal.",
            editable: false,
            body: balanceTemplate,
        },
    ];

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-2">🧾 Ledger Management</h2>

            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    Customer Ledger Summary
                </legend>

                <TTypeFooterDatatable
                    data={ledger}
                    columns={ledgerColumns}
                    primaryKey="customerLedgerId"
                    isNew={false}
                    isSave={false}
                    isDelete={false}
                    isEdit={false}
                    showDateFilter={true}
                    showDdlFilter={true}
                    page="customerledge"
                    footerValue={ledgerFooter}
                />

            </fieldset>
        </div>
    );
}
