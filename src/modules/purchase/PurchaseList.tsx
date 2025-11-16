import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Sidebar } from "primereact/sidebar";
import { PurchaseModel } from "../../models/purchase/PurchaseModel";
import { useToast } from "../../components/ToastService";
import apiService from "../../services/apiService";
import { PurchaseForm } from "./PurchaseForm";

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

    // Load all data
    const loadAllData = async () => {
        setLoading(true);
        try {
            const purchasesRes = await apiService.get("/Purchase");
            setPurchases(purchasesRes ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Create empty purchase
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
        purchaseItems: [],
    });

    // Add new purchase
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

    if (loading) return <p>Loading purchases...</p>;

    return (
        <div className="p-3 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">🧾 Purchase Management</h2>

            <TabView>
                <TabPanel header="Purchases">
                    {purchases.length === 0 ? <p>No purchases found.</p> : (
                        <div className="space-y-2">
                            {purchases.map((p, idx) => (
                                <div
                                    key={p.purchaseId}
                                    className="p-3 border border-gray-200 rounded-md flex justify-between items-center"
                                >
                                    <div>
                                        {/* <strong>{p.invoiceDate.slice(0, 10)}</strong> | Supplier: {suppliers.find(s => s.value === p.supplierId)?.label} */}
                                    </div>
                                    <Button label="Edit" icon="pi pi-pencil" onClick={() => handleOpenEdit(p)} />
                                </div>
                            ))}
                        </div>
                    )}
                </TabPanel>

                <TabPanel header="Add / Edit Purchases">
                    <div className="flex gap-2 mb-2">
                        <Button label="Add New" icon="pi pi-plus" outlined severity="success" onClick={addNewPurchase} />
                        <Button label="Save All" icon="pi pi-save" onClick={handleSavePurchases} disabled={!newPurchases.length} />
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

            <Sidebar visible={sidebarVisible} position="right" onHide={() => setSidebarVisible(false)} header="Edit Purchase" style={{ width: '60rem' }}>
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
        </div>
    );
}
