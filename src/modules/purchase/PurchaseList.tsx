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
    const [newPurchases, setNewPurchases] = useState<PurchaseModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseModel | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { showSuccess, showError } = useToast();
    const [validationErrorsAll, setValidationErrorsAll] = useState<
        Record<number, Record<string, string>>
    >({});
    const [triggerValidation, setTriggerValidation] = useState(0);
    const [viewType, setViewType] = useState<"simple" | "detailed">("simple");
    const [editParentRow, setEditParentRow] = useState<PurchaseModel | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        setEditParentRow(row);       // set the row data to edit
        setIsSidebarOpen(true);      // open sidebar/modal for editing
    };

    const createEmptyPurchase = (): PurchaseModel => ({
        purchaseId: 0,
        supplierId: 0,
        supplierName: "",
        purchaseDate: new Date().toISOString(),
        invoiceDate: new Date().toISOString(),
        invoiceAmount: 0,
        invoiceNumber: "",
        totalAmount: 0,
        totalGST: 0,
        grandTotal: 0,
        isActive: true,
        purchaseTypeId: 0,
        paidAmount: 0,
        purchaseItems: [],
    });

    const addNewPurchase = () => {
        setNewPurchases((prev) => [createEmptyPurchase(), ...prev]);
    };

    const handleUpdateNewPurchase = (index: number, updated: PurchaseModel) => {
        setNewPurchases((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };

    const handleRemoveNewPurchase = (index: number) => {
        setNewPurchases((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSavePurchases = async () => {
        const errors: Record<string, string> = {};
        newPurchases.forEach((p, idx) => {
            if (!p.supplierId) errors[`purchase-${idx}-supplierId`] = "Supplier is required";
            if (!p.purchaseDate) errors[`purchase-${idx}-purchaseDate`] = "Purchase Date is required";
            if (!p.purchaseItems || p.purchaseItems.length === 0) errors[`purchase-${idx}-purchaseItems`] = "Add at least one item";
        });

        setTriggerValidation(Date.now());

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await apiService.post("/Purchase", newPurchases[0]);
            await loadAllData();
            setNewPurchases([]);
            setValidationErrors({});
            showSuccess("Purchases saved successfully!");
        } catch (err) {
            console.error(err);
            showError("Error saving purchases. Try again.");
        }
    };

    const handleOpenEdit = (purchase: PurchaseModel) => {
        setSelectedPurchase({ ...purchase });
        setSidebarVisible(true);
    };

    const handleUpdatePurchase = async (updated: PurchaseModel) => {
        try {
            if (updated.purchaseId) {
                await apiService.put(`/Purchase/${updated.purchaseId}`, updated);
            }
            setPurchases((prev) =>
                prev.map((p) => (p.purchaseId === updated.purchaseId ? updated : p))
            );
            showSuccess("Purchase updated successfully!");
            setSidebarVisible(false);
            setSelectedPurchase(null);
        } catch (err) {
            console.error(err);
            showError("Error updating purchase. Try again.");
        }
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
                    severity="success"
                    className="amount-tag"
                />
            )
        },
        {
            field: "paidAmount",
            header: "Paid Amt",
            width: "110px",
            body: (row) => {
                if (row.paidAmount == null) return "";
                const isPaidFull = row.paidAmount === row.invoiceAmount;
                return (
                    <Tag
                        value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.paidAmount)}
                        severity={isPaidFull ? "success" : "danger"}
                        className="amount-tag"
                    />
                );
            },
        },
        {
            field: "balanceAmount",
            header: "Bal Amt",
            width: "120px",
            body: (row: PurchaseModel) => {
                const paid = row.paidAmount ?? 0;
                let balance = row.invoiceAmount - paid;

                let severity: "success" | "warning" | "danger" = "warning";
                let displayValue: any = balance;

                if (balance === 0) {
                    severity = "success";
                } else if (balance < 0) {
                    severity = "danger";
                    displayValue = -balance;
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
                    return <Tag value={displayValue} severity={severity} className="amount-tag" />;
                } else {
                    severity = "warning";
                }

                return (
                    <Tag
                        value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
                        severity={severity}
                        className="amount-tag"
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
                    severity = "warning"; // fully settled
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
                } else if (balance < 0) {
                    // We need to pay buyer → red
                    severity = "success";
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
                } else {
                    // Buyer needs to pay us → green
                    severity = "danger";
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
                }

                return <Tag value={displayValue} severity={severity} className="amount-tag" />;
            },
        },
        {
            field: "totalAmount",
            header: "Total Amt",
            width: "110px",
            body: (row) =>
                row.totalAmount != null
                    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.totalAmount)
                    : "",
        },
        {
            field: "totalGST",
            header: "Gst Amt",
            width: "110px",
            body: (row) =>
                row.totalGST != null
                    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.totalGST)
                    : "",
        },
        {
            field: "grandTotal",
            header: "Grand Total",
            width: "110px",
            body: (row) =>
                row.grandTotal != null
                    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.grandTotal)
                    : "",
        },
        { field: "invoiceDate", header: "Invoice Date", width: "110px" },
    ];

    const parentColumns = [
        { field: "supplierName", header: "Supplier" },
        { field: "invoiceNumber", header: "Invoice No" },
        { field: "purchaseRefNo", header: "Ref No", width: "170px" },
        { field: "purchaseDate", header: "Purchase Date", width: "130px" },
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
                    severity="success"
                    className="amount-tag"
                />
            )
        },
        {
            field: "paidAmount",
            header: "Paid Amt",
            width: "130px",
            body: (row: PurchaseModel) => (
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.paidAmount)}
                    severity={row.paidAmount === row.invoiceAmount ? "success" : "danger"}
                    className="amount-tag"
                />
            )
        },
        {
            field: "balanceAmount",
            header: "Bal Amt",
            width: "120px",
            body: (row: PurchaseModel) => {
                const paid = row.paidAmount ?? 0;
                let balance = row.invoiceAmount - paid;

                let severity: "success" | "warning" | "danger" = "warning";
                let displayValue: any = balance;

                if (balance === 0) {
                    severity = "success";
                } else if (balance < 0) {
                    severity = "danger";
                    displayValue = -balance;
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}`;
                    return <Tag value={displayValue} severity={severity} className="amount-tag" />;
                } else {
                    severity = "warning";
                }

                return (
                    <Tag
                        value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(displayValue)}
                        severity={severity}
                        className="amount-tag"
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
                    severity = "warning"; // fully settled
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance);
                } else if (balance < 0) {
                    // We need to pay buyer → red
                    severity = "success";
                    displayValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(-balance);
                } else {
                    // Buyer needs to pay us → green
                    severity = "danger";
                    displayValue = `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}`;
                }

                return <Tag value={displayValue} severity={severity} className="amount-tag" />;
            },
        },
        {
            field: "grandTotal",
            header: "Grand Total",
            body: (row: PurchaseModel) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.grandTotal)
        }
    ];

    const childColumns: ColumnMeta<PurchaseItemModel>[] = [
        { field: "productName", header: "Product Name" },
        {
            field: "unitPrice", header: "Rate",
            body: (row: PurchaseItemModel) =>
                new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.unitPrice)
        },
        {
            field: "quantity",
            header: "Qty",
            body: (row: PurchaseItemModel) => row.quantity.toFixed(2)
        },
        { field: "gstPercent", header: "GST %", editable: true, type: "decimal", required: true },
        {
            field: "amount",
            header: "Amount",
            editable: false,
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


    if (loading) return <p>Loading purchases...</p>;

    return (
        <div className="p-3 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">🧾 Purchase Management</h2>

            <TabView>
                <TabPanel header="Purchases">

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
                            />
                        </div>
                    )}
                </TabPanel>

                <TabPanel header="Add / Edit Purchases">
                    <div className="flex gap-2 mb-2">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewPurchase} />
                        <Button label="Save" icon="pi pi-save" onClick={handleSavePurchases} disabled={!newPurchases.length} />
                    </div>

                    <div className="space-y-4">
                        {newPurchases.length === 0 ? (
                            <p className="text-gray-500">No new purchases. Click "Add New" to create.</p>
                        ) : newPurchases.map((p, idx) => (
                            <PurchaseForm
                                key={idx}
                                purchase={p}
                                newPurchase={p}
                                index={idx}
                                validationErrors={validationErrorsAll[idx] ?? {}}
                                triggerValidation={triggerValidation}
                                onValidation={(childErr) => {
                                    setValidationErrorsAll((prev) => ({
                                        ...prev,
                                        [idx]: childErr
                                    }));
                                }}
                                onSave={(updated) => handleUpdateNewPurchase(idx, updated)}
                                onCancel={() => handleRemoveNewPurchase(idx)}
                                isEditSidebar={false}
                            />
                        ))}
                    </div>
                </TabPanel>
            </TabView>

            <Sidebar visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                header="Edit Purchase"
                style={{ width: '70rem' }}>
                {selectedPurchase ? (
                    <PurchaseForm
                        key={selectedPurchase.purchaseId || "edit"}
                        purchase={selectedPurchase}
                        newPurchase={selectedPurchase}
                        validationErrors={validationErrors}
                        onSave={handleUpdatePurchase}
                        onCancel={() => setSidebarVisible(false)}
                        isEditSidebar={true}
                        triggerValidation={triggerValidation}
                    />
                ) : <p className="p-4 text-gray-500 text-center">Select a purchase to edit.</p>}
            </Sidebar>

            {isSidebarOpen && editParentRow && (
                <Sidebar
                    position="right"
                    visible={isSidebarOpen}
                    onHide={() => setIsSidebarOpen(false)}
                    header="Edit Purchase"
                    style={{ width: '70rem' }}
                >
                    <PurchaseForm
                        key={editParentRow.purchaseId || "edit"}
                        purchase={editParentRow}
                        newPurchase={editParentRow}
                        validationErrors={validationErrors}
                        onSave={(updated) => {
                            // update purchases state
                            setPurchases((prev) =>
                                prev.map((p) => (p.purchaseId === updated.purchaseId ? updated : p))
                            );
                            setIsSidebarOpen(false);
                            setEditParentRow(null);
                            showSuccess("Purchase updated successfully!");
                        }}
                        onCancel={() => {
                            setIsSidebarOpen(false);
                            setEditParentRow(null);
                        }}
                        isEditSidebar={true}
                        triggerValidation={triggerValidation}
                    />
                </Sidebar>
            )}
        </div>
    );
}
