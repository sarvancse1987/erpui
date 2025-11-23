import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../../components/TTypedDatatable";
import apiService from "../../../services/apiService";
import { UnitModel } from "../../../models/product/UnitModel";

export default function Unit() {
    const [units, setUnits] = useState<UnitModel[]>([]);
    const [activeUnits, setActiveUnits] = useState<UnitModel[]>([]);
    const [inactiveUnits, setInActiveUnits] = useState<UnitModel[]>([]);

    const baseColumns: ColumnMeta<UnitModel>[] = [
        { field: "id", header: "ID", editable: false, hidden: true },
        { field: "name", header: "Unit Name", editable: true, required: true },
        { field: "description", header: "Description", editable: true },
        { field: "isActive", header: "Active", editable: true, type: "checkbox" },
    ];

    // Columns for active tab (hide isActive)
    const activeColumns = baseColumns.filter(col => col.field !== "isActive");
    const inactiveColumns = baseColumns;

    const fetchUnits = async () => {
        try {
            const response = await apiService.get("/Unit");
            const categoriesArray: UnitModel[] = response ?? [];

            setActiveUnits(categoriesArray.filter(c => c.isActive));
            setInActiveUnits(categoriesArray.filter(c => !c.isActive));
            setUnits(categoriesArray);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            setActiveUnits([]);
            setInActiveUnits([]);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const saveUnits = async (
        updatedCategories: UnitModel[],
        isActiveTab: boolean
    ): Promise<void> => {
        try {
            // Save categories via API
            await apiService.post("/unit/bulk", updatedCategories);

            // Fetch the latest categories
            const response = await apiService.get("/Unit");
            const latestCategories: UnitModel[] = response ?? [];

            // Update frontend state
            setActiveUnits(latestCategories.filter(c => c.isActive));
            setInActiveUnits(latestCategories.filter(c => !c.isActive));
            setUnits(latestCategories);
        } catch (error) {
            console.error("Failed to save categories", error);
        }
    };

    // ✅ Make handlers async and await save
    const onActiveSave = async (updated: UnitModel[]) => {
        const updatedWithActive = updated.map(c => ({ ...c, isActive: true }));
        await saveUnits(updatedWithActive, true);
    };

    const onInactiveSave = async (updated: UnitModel[]) => {
        await saveUnits(updated, false);
    };

    const onActiveDelete = async (toDelete: UnitModel[]) => {
        const updatedWithActive = toDelete.map(c => ({ ...c, isActive: false }));
        await saveUnits(updatedWithActive, true);
    }

    return (
        <div className="p-2">
            <h2 className="mb-1 text-lg font-semibold">🧩 Unit Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'green' }}>
                        <i className="pi pi-check-circle" />
                        <span>Active</span>
                    </div>}>
                    <TTypedDatatable<UnitModel>
                        columns={activeColumns}
                        data={activeUnits.map(c => ({ ...c, isActive: true }))}
                        primaryKey="id"
                        onSave={onActiveSave}
                        onDelete={onActiveDelete}
                        isNew={true}
                        isSave={true}
                        isDelete={true}
                        sortableColumns={['name']}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'red' }}>
                        <i className="pi pi-times-circle" />
                        <span>Inactive</span>
                    </div>}>
                    <TTypedDatatable<UnitModel>
                        columns={inactiveColumns}
                        data={inactiveUnits}
                        primaryKey="id"
                        onSave={onInactiveSave}
                        isNew={true}
                        isSave={true}
                        isDelete={true}
                        sortableColumns={['name']}
                    />
                </TabPanel>
            </TabView>
        </div>
    );
}
