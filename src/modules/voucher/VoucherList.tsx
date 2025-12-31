import { TabPanel, TabView } from "primereact/tabview";
import { useToast } from "../../components/ToastService";
import { useEffect, useState } from "react";
import { RadioButton } from "primereact/radiobutton";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { VoucherModel } from "../../models/voucher/VoucherModel";
import VoucherForm from "./VoucherForm";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import apiService from "../../services/apiService";
import { Tag } from "primereact/tag";
import { Sidebar } from "primereact/sidebar";
import { ParentChildTable } from "../../components/ParentChildTable";
import { VoucherCustomerModel } from "../../models/voucher/VoucherCustomerModel";

export default function VoucherList() {
    const [viewType, setViewType] = useState<"simple" | "detailed">("simple");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [vouchers, setVouchers] = useState<VoucherModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherModel | null>(null);
    const [voucherItems, setVoucherItems] = useState<VoucherCustomerModel[]>([]);

    const columns: ColumnMeta<VoucherModel>[] = [
        { field: "voucherId", header: "ID", editable: false, hidden: true },
        { field: "customerId", header: "ID", editable: false, hidden: true },
        { field: "customerName", header: "Customer Name", width: "160px", frozen: true },
        { field: "voucherDate", header: "Date", width: "80px" },
        { field: "voucherTime", header: "Time", width: "90px" },
        { field: "voucherNo", header: "Voucher No", width: "80px" },
        {
            field: "totalCredit", header: "Received Amt", width: "90px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.totalCredit)}
                    className="amount-tag"
                    style={{
                        backgroundColor: "#3498db",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        display: "inline-block",
                        textAlign: "center",
                        width: "90px"
                    }}
                />
        },
        {
            field: "totalDebit", header: "Debit Amt", width: "90px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.totalDebit)}
                    className="amount-tag"
                    style={{
                        backgroundColor: "#cee063ff",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        display: "inline-block",
                        textAlign: "center",
                        width: "90px"
                    }}
                />
        },
        {
            field: "closingBalance",
            header: "Closing Bal",
            width: "90px",
            body: (row) => {
                const balance = row.closingBalance ?? 0;
                const isGreen = balance <= 0;

                return (
                    <Tag
                        value={new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR"
                        }).format(balance)}
                        className="amount-tag"
                        style={{
                            backgroundColor: isGreen ? "#22c55e" : "#ef4444",
                            color: "white",
                            fontWeight: "500",
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            display: "inline-block",
                            textAlign: "center",
                            width: "90px"
                        }}
                    />
                );
            }
        },
        { field: "phone", header: "Phone", width: "160px", frozen: true },
        { field: "address", header: "Address", width: "160px", frozen: true },
    ];

    const parentColumns = [
        { field: "customerName", header: "customer Name", width: "180px" }
    ]

    const childColumns: ColumnMeta<VoucherModel>[] = [
        { field: "customerName", header: "Customer Name", width: "160px", frozen: true },
        { field: "voucherDate", header: "Date", width: "80px" },
        { field: "voucherTime", header: "Time", width: "90px" },
        { field: "voucherNo", header: "Voucher No", width: "80px" },
        {
            field: "totalCredit", header: "Received Amt", width: "90px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.totalCredit)}
                    className="amount-tag"
                    style={{
                        backgroundColor: "#3498db",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        display: "inline-block",
                        textAlign: "center",
                        width: "90px"
                    }}
                />
        },
        {
            field: "totalDebit", header: "Debit Amt", width: "90px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.totalDebit)}
                    className="amount-tag"
                    style={{
                        backgroundColor: "#cee063ff",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        display: "inline-block",
                        textAlign: "center",
                        width: "90px"
                    }}
                />
        },
        {
            field: "closingBalance",
            header: "Closing Bal",
            width: "90px",
            body: (row) => {
                const balance = row.closingBalance ?? 0;
                const isGreen = balance <= 0;

                return (
                    <Tag
                        value={new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR"
                        }).format(balance)}
                        className="amount-tag"
                        style={{
                            backgroundColor: isGreen ? "#22c55e" : "#ef4444",
                            color: "white",
                            fontWeight: "500",
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            display: "inline-block",
                            textAlign: "center",
                            width: "90px"
                        }}
                    />
                );
            }
        },
        { field: "phone", header: "Phone", width: "160px", frozen: true },
        { field: "address", header: "Address", width: "160px", frozen: true },
    ];

    const prepareVoucherCustomerList = (
        vouchers: VoucherModel[]
    ): VoucherCustomerModel[] => {

        const map = new Map<number, VoucherCustomerModel>();

        vouchers.forEach(v => {
            if (!v.customerId) return;

            if (!map.has(v.customerId)) {
                map.set(v.customerId, {
                    customerId: v.customerId,
                    customerName: v.customerName,
                    vouchers: []
                });
            }

            map.get(v.customerId)!.vouchers.push(v);
        });

        return Array.from(map.values());
    };


    const loadData = async () => {
        const cr = await apiService.get(`/voucher/GetVoucherInfo`);
        const data = cr?.data ?? [];
        setVouchers(data);

        const customerVoucherList = prepareVoucherCustomerList(data);
        setVoucherItems(customerVoucherList);
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenEdit = (voucher: VoucherModel) => {
        setSelectedVoucher(voucher ?? null);
        setIsSidebarOpen(true);
    }

    const handleParentEdit = (row: VoucherCustomerModel) => {
        if (row != null) {
            setSelectedVoucher(row.vouchers[0] ?? null);
            setIsSidebarOpen(true);
        }
    };

    const handleOnDelete = () => { }

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">🧾 Voucher Management</h2>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-file-edit" />
                        <span>Vouchers</span>
                    </div>
                }>

                    <div className="flex gap-4 mb-3">
                        <div className="flex items-center gap-1">
                            <RadioButton
                                inputId="simpleView"
                                name="viewType"
                                value="simple"
                                onChange={(e) => setViewType(e.value)}
                                checked={viewType === "simple"}
                            />
                            <label htmlFor="simpleView" className="text-sm">Basic View</label>
                        </div>
                        <div className="flex items-center gap-1">
                            <RadioButton
                                inputId="detailedView"
                                name="viewType"
                                value="detailed"
                                onChange={(e) => setViewType(e.value)}
                                checked={viewType === "detailed"}
                            />
                            <label htmlFor="detailedView" className="text-sm">Detailed View</label>
                        </div>
                    </div>

                    {viewType === "simple" ? (
                        <TTypeDatatable<VoucherModel>
                            data={vouchers}
                            columns={columns}
                            primaryKey="voucherId"
                            onEdit={handleOpenEdit}
                            isDelete={true}
                            onDelete={handleOnDelete}
                            isNew={false}
                            isSave={false}
                            page="voucher"
                            showDateFilter={true}
                        />
                    ) : (
                        <div className="space-y-2">
                            <ParentChildTable<VoucherCustomerModel, VoucherModel>
                                parentData={voucherItems}
                                parentColumns={parentColumns as ColumnMeta<VoucherCustomerModel>[]}
                                childColumns={childColumns as ColumnMeta<VoucherModel>[]}
                                childField={"vouchers" as keyof VoucherCustomerModel}
                                rowKey={"customerId" as keyof VoucherCustomerModel}
                                expandAllInitially={false}
                                onEdit={handleParentEdit}
                            />
                        </div>
                    )}
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="space-y-4">
                        <VoucherForm
                            voucher={selectedVoucher}
                            onSave={() => {
                                setActiveIndex(0);
                                loadData();
                                setIsSidebarOpen(false);
                            }}
                            onCancel={() => setIsSidebarOpen(false)}
                            isEditSidebar={false}
                        />
                    </div>
                </TabPanel>

            </TabView>

            <Sidebar visible={isSidebarOpen}
                position="right"
                onHide={() => setIsSidebarOpen(false)}
                header="Edit Voucher"
                style={{ width: '70rem' }}>
                {selectedVoucher ? (
                    <VoucherForm
                        key={selectedVoucher.voucherId || "edit"}
                        isEditSidebar={true}
                        voucher={selectedVoucher}
                        onSave={() => {
                            setActiveIndex(0);
                            loadData();
                            setIsSidebarOpen(false);
                        }}
                        onCancel={() => { setIsSidebarOpen(false); }}
                    />
                ) : <p className="p-4 text-gray-500 text-center">Select a sale to edit.</p>}
            </Sidebar>
        </div>
    )
}