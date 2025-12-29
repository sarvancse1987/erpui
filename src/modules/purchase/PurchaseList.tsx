import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Sidebar } from "primereact/sidebar";
import { PurchaseModel } from "../../models/purchase/PurchaseModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { PurchaseForm } from "./PurchaseForm";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { RadioButton } from "primereact/radiobutton";
import { ParentChildTable } from "../../components/ParentChildTable";
import { PurchaseItemModel } from "../../models/purchase/PurchaseItemModel";

export default function PurchaseList() {
    const [purchases, setPurchases] = useState<PurchaseModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseModel | null>(null);
    const { showSuccess, showError } = useToast();
    const [viewType, setViewType] = useState<"simple" | "detailed">("simple");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const res = await apiService.get(`/Purchase/purchasedetails`);
            const mapped = res.purchase.map((p: any) => ({
                ...p,
                purchaseItems: res.items.filter((i: any) => i.purchaseId === p.purchaseId),
            }));
            setPurchases(mapped ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleParentEdit = (row: PurchaseModel) => {
        if (row != null) {
            setSelectedPurchase(row);
            setIsSidebarOpen(true);
        }
    };

    const handleOpenEdit = (purchase: PurchaseModel) => {
        setSelectedPurchase({ ...purchase });
        setIsSidebarOpen(true);
    };

    const handleDeletePurchase = async (rows: PurchaseModel[]) => {
        try {
            // Extract IDs only
            const ids = rows.map(r => r.purchaseId);

            // Call API (bulk delete)
            await apiService.post("/purchase/bulk-delete", ids);

            showSuccess("Purchase(s) deleted successfully!");

            // Reload table
            //await loadSuppliers();
        } catch (err) {
            console.error(err);
            showError("Error deleting suppliers");
        }
    };

    const columns: ColumnMeta<PurchaseModel>[] = [
        { field: "purchaseId", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "supplierId", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "supplierName", header: "Supplier Name", width: "220px", frozen: true },
        { field: "invoiceNumber", header: "Invoice No", width: "130px" },
        { field: "purchaseRefNo", header: "Pur Ref No", width: "160px" },
        { field: "purchaseDate", header: "Pur Date", width: "100px" },
        { field: "invoiceDate", header: "Invoice Date", width: "110px" },
        {
            field: "purchaseTypeName",
            header: "Pur Type",
            width: "110px",
            body: (row: PurchaseModel) => {
                let severity: "success" | "warning" | "info" | "danger" = "info";

                switch (row.purchaseTypeName) {
                    case "Cash":
                        severity = "success"; // green
                        break;
                    case "Credit":
                        severity = "danger"; // yellow
                        break;
                    case "Partially Paid":
                        severity = "warning"; // red
                        break;
                    default:
                        severity = "info"; // blue/neutral
                }

                return (
                    <Tag
                        value={row.purchaseTypeName}
                        severity={severity}
                        className="purchase-type-tag"
                        style={{ width: "90px" }}
                    />
                );
            },
        },
        {
            field: "invoiceAmount",
            header: "Invoice Amt",
            width: "110px",
            body: (row: PurchaseModel) => (
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.invoiceAmount)}
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
            )
        },
        {
            field: "cash",
            header: "Paid Amt",
            width: "140px",
            body: (row) => {
                const cash = row.cash ?? 0;
                const upi = row.upi ?? 0;

                const totalPaid =
                    (row.cash ?? 0) +
                    (row.upi ?? 0);

                if (!cash && !upi) return "";

                const format = (v: any) =>
                    new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(v);

                const isPaidFull = totalPaid === row.invoiceAmount;

                return (
                    <Tag
                        severity={isPaidFull ? "success" : "danger"}
                        className="amount-tag"
                        style={{ width: "130px", padding: "4px" }}
                    >
                        <div className="flex flex-col leading-tight text-xs">
                            {cash ? <span>Cash – {format(cash)}</span> : null}
                            {upi ? <span>UPI – {format(upi)}</span> : null}
                        </div>
                    </Tag>
                );
            },
        },
        {
            field: "balanceAmount",
            header: "Bal Amt",
            width: "120px",
            body: (row: PurchaseModel) => {
                const cash = row.cash ?? 0;
                const upi = row.upi ?? 0;
                const paid = cash + upi;
                let balance = row.invoiceAmount - paid;

                let severity: "success" | "warning" | "danger" = "warning";
                let displayValue: any = balance;

                if (balance === 0) {
                    severity = "success";
                } else if (balance < 0) {
                    severity = "danger";
                    displayValue = -balance;
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
                    return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
                } else {
                    severity = "warning";
                }

                return (
                    <Tag
                        value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
                        severity={severity}
                        className="amount-tag"
                        style={{ width: "90px" }}
                    />
                );
            },
        },
        {
            field: "runningBalance",
            header: "Run Amt",
            width: "120px",
            body: (row: PurchaseModel) => {
                const balance = row.runningBalance ?? 0; // cumulative/current balance

                let severity: "success" | "warning" | "danger";
                let displayValue: string;

                if (balance === 0) {
                    severity = "success";
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
                } else if (balance < 0) {
                    // We need to pay buyer → red
                    severity = "warning";
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
                } else {
                    // Buyer needs to pay us → green
                    severity = "danger";
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
                }

                return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
            },
        },
        {
            field: "totalAmount",
            header: "Total Amt",
            width: "110px",
            body: (row: PurchaseModel) => (
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.totalAmount)}
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
            )
        },
        {
            field: "totalGST",
            header: "Gst Amt",
            width: "110px",
            body: (row: PurchaseModel) => (
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.totalGST)}
                    className="amount-tag"
                    style={{
                        backgroundColor: "#dbb434ff",
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
            )
        },
        {
            field: "grandTotal",
            header: "Grand Total",
            width: "110px",
            body: (row: PurchaseModel) => (
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.grandTotal)}
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
            )
        },
    ];

    const parentColumns = [
        { field: "supplierName", header: "Supplier", width: "130px" },
        { field: "invoiceNumber", header: "Invoice No", width: "130px" },
        { field: "purchaseRefNo", header: "Ref No", width: "180px" },
        { field: "purchaseDate", header: "Pur Date", width: "130px" },
        { field: "invoiceDate", header: "Invoice Date", width: "110px" },
        {
            field: "purchaseTypeName",
            header: "Pur Type",
            width: "110px",
            body: (row: PurchaseModel) => {
                let severity: "success" | "warning" | "info" | "danger" = "info";

                switch (row.purchaseTypeName) {
                    case "Cash":
                        severity = "success"; // green
                        break;
                    case "Credit":
                        severity = "danger"; // yellow
                        break;
                    case "Partially Paid":
                        severity = "warning"; // red
                        break;
                    default:
                        severity = "info"; // blue/neutral
                }

                return (
                    <Tag
                        value={row.purchaseTypeName}
                        severity={severity}
                        className="purchase-type-tag"
                        style={{ width: "90px" }}
                    />
                );
            },
        },
        {
            field: "invoiceAmount",
            header: "Invoice Amt",
            width: "130px",
            body: (row: PurchaseModel) => (
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.invoiceAmount)}
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
            )
        },
        {
            field: "cash",
            header: "Paid Amt",
            width: "140px",
            body: (row: PurchaseModel) => {
                const cash = row.cash ?? 0;
                const upi = row.upi ?? 0;

                const totalPaid =
                    (row.cash ?? 0) +
                    (row.upi ?? 0);

                if (!cash && !upi) return "";

                const format = (v: any) =>
                    new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(v);

                const isPaidFull = totalPaid === row.invoiceAmount;

                return (
                    <Tag
                        severity={isPaidFull ? "success" : "danger"}
                        className="amount-tag"
                        style={{ width: "130px", padding: "4px" }}
                    >
                        <div className="flex flex-col leading-tight text-xs">
                            {cash ? <span>Cash – {format(cash)}</span> : null}
                            {upi ? <span>UPI – {format(upi)}</span> : null}
                        </div>
                    </Tag>
                );
            },
        },
        {
            field: "balanceAmount",
            header: "Bal Amt",
            width: "120px",
            body: (row: PurchaseModel) => {
                const cash = row.cash ?? 0;
                const upi = row.upi ?? 0;
                const paid = cash + upi;
                let balance = row.invoiceAmount - paid;

                let severity: "success" | "warning" | "danger" = "warning";
                let displayValue: any = balance;

                if (balance === 0) {
                    severity = "success";
                } else if (balance < 0) {
                    severity = "danger";
                    displayValue = -balance;
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
                    return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
                } else {
                    severity = "warning";
                }

                return (
                    <Tag
                        value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
                        severity={severity}
                        className="amount-tag"
                        style={{ width: "90px" }}
                    />
                );
            },
        },
        {
            field: "runningBalance",
            header: "Run Amt",
            width: "120px",
            body: (row: PurchaseModel) => {
                const balance = row.runningBalance ?? 0;

                let severity: "success" | "warning" | "danger";
                let displayValue: string;

                if (balance === 0) {
                    severity = "success";
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
                } else if (balance < 0) {
                    severity = "warning";
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
                } else {
                    severity = "danger";
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
                }

                return <Tag value={displayValue} severity={severity} className="amount-tag" style={{ width: "90px" }} />;
            },
        },
        {
            field: "grandTotal",
            header: "Total",
            width: "120px",
            body: (row: PurchaseModel) => (
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.grandTotal)}
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
            )
        }
    ];

    const childColumns: ColumnMeta<PurchaseItemModel>[] = [
        {
            field: "productName", header: "Product Name", width: "220px", body: (row: PurchaseItemModel) => (
                <div className="flex items-center gap-2">
                    <span className="truncate max-w-[150px]">
                        {row.productName || ""}
                    </span>

                    {row.productName && (
                        <i
                            className="pi pi-copy cursor-pointer text-blue-600 hover:text-blue-800"
                            title="Copy Product Name"
                            onClick={(e) => {
                                e.stopPropagation(); // ✅ prevent row click/edit
                                navigator.clipboard.writeText(row.productName);
                            }}
                        />
                    )}
                </div>
            ),
        },
        {
            field: "unitPrice", header: "Rate", width: "170px",
            body: (row: PurchaseItemModel) =>
                new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
        },
        {
            field: "quantity",
            header: "Qty",
            width: "170px",
            body: (row: PurchaseItemModel) => row.quantity.toFixed(2)
        },
        { field: "gstPercent", header: "GST %", editable: true, type: "decimal", required: true, width: "110px" },
        {
            field: "amount",
            header: "Amount",
            editable: false,
            width: "170px",
            body: (row: PurchaseItemModel) => (
                <div
                    className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
                    style={{
                        background: "#2ecc71",
                        color: "white",
                        borderRadius: "0px",
                        minWidth: "90px",
                        textAlign: "center",
                        height: "100%",
                    }}
                >
                    ₹{(row.amount ?? 0).toFixed(2)}
                </div>
            ),
        },
        {
            field: "gstAmount",
            header: "GST Amount",
            editable: false,
            width: "170px",
            body: (row: PurchaseItemModel) => (
                <div
                    className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
                    style={{
                        background: "#f1c40f",
                        color: "black",
                        borderRadius: "0px",
                        minWidth: "90px",
                        textAlign: "center",
                        height: "100%",
                    }}
                >
                    ₹{(row.gstAmount ?? 0).toFixed(2)}
                </div>
            ),
        },
        {
            field: "totalAmount",
            header: "Grand Total",
            editable: false,
            width: "170px",
            body: (row: PurchaseItemModel) => (
                <div
                    className="flex items-center justify-center py-2 px-2 text-sm font-semibold"
                    style={{
                        background: "#3498db",
                        color: "white",
                        borderRadius: "0px",
                        minWidth: "90px",
                        textAlign: "center",
                        height: "100%",
                    }}
                >
                    ₹{(row.totalAmount ?? 0).toFixed(2)}
                </div>
            ),
        },
    ];

    const closeEditSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedPurchase(null);
    };

    if (loading)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100%",
                }}
            >
                <p>Loading purchases...</p>
            </div>
        );

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">🧾 Purchase Management</h2>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-shopping-cart" />
                        <span>Purchases</span>
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

                    {purchases.length === 0 ? (
                        <p>No purchases found.</p>
                    ) : viewType === "simple" ? (
                        <TTypeDatatable<PurchaseModel>
                            data={purchases}
                            columns={columns}
                            primaryKey="purchaseId"
                            onEdit={handleOpenEdit}
                            isDelete={true}
                            onDelete={handleDeletePurchase}
                            isNew={false}
                            isSave={false}
                            sortableColumns={["grandTotal", "purchaseDate"]}
                            page="purchase"
                            showDateFilter={true}
                        />
                    ) : (
                        <div className="space-y-2">
                            <ParentChildTable<PurchaseModel, PurchaseItemModel>
                                parentData={purchases}
                                parentColumns={parentColumns as ColumnMeta<PurchaseModel>[]}
                                childColumns={childColumns as ColumnMeta<PurchaseItemModel>[]}
                                childField={"purchaseItems" as keyof PurchaseModel}
                                rowKey={"purchaseId" as keyof PurchaseModel}
                                expandAllInitially={false}
                                onEdit={handleParentEdit}
                                sortableColumns={["grandTotal", "purchaseDate"]}
                                page="purchase"
                                showDateFilter={true}
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
                        <PurchaseForm
                            key={1}
                            isEditSidebar={false}
                            purchase={selectedPurchase}
                            onSaveSuccess={() => {
                                setActiveIndex(0);
                                loadAllData();
                                setIsSidebarOpen(false);
                            }}
                            onCancel={closeEditSidebar}
                        />
                    </div>
                </TabPanel>
            </TabView>

            <Sidebar visible={isSidebarOpen}
                position="right"
                onHide={() => setIsSidebarOpen(false)}
                showCloseIcon={true}
                header="Edit Purchase"
                style={{ width: '70rem' }}>
                {selectedPurchase ? (
                    <PurchaseForm
                        key={selectedPurchase.purchaseId || "edit"}
                        isEditSidebar={true}
                        purchase={selectedPurchase}
                        onSaveSuccess={() => {
                            setActiveIndex(0);
                            loadAllData();
                            setIsSidebarOpen(false);
                        }}
                        onCancel={closeEditSidebar}
                    />
                ) : <p className="p-4 text-gray-500 text-center">Select a purchase to edit.</p>}
            </Sidebar>

            {isSidebarOpen && selectedPurchase && (
                <Sidebar
                    position="right"
                    visible={isSidebarOpen}
                    onHide={() => setIsSidebarOpen(false)}
                    showCloseIcon={true}
                    header="Edit Purchase"
                    style={{ width: '90rem' }}
                >
                    <PurchaseForm
                        key={selectedPurchase.purchaseId || "edit"}
                        isEditSidebar={true}
                        purchase={selectedPurchase}
                        onSaveSuccess={() => {
                            setActiveIndex(0);
                            loadAllData();
                            setIsSidebarOpen(false);
                        }}
                        onCancel={closeEditSidebar}
                    />
                </Sidebar>
            )}
        </div>
    );
}
