import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { ColumnMeta } from "../../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../../components/TTypedDatatable";
import apiService from "../../../services/apiService";
import { CategoryModel } from "../../../models/product/CategoryModel";

export default function Category() {
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [activeCategories, setActiveCategories] = useState<CategoryModel[]>([]);
    const [inactiveCategories, setInActiveCategories] = useState<CategoryModel[]>([]);

    const baseColumns: ColumnMeta<CategoryModel>[] = [
        { field: "categoryId", header: "ID", editable: false, hidden: true },
        { field: "categoryName", header: "Category Name", editable: true, required: true },
        { field: "categoryDescription", header: "Description", editable: true },
        { field: "isActive", header: "Active", editable: true, type: "checkbox" },
    ];

    // Columns for active tab (hide isActive)
    const activeColumns = baseColumns.filter(col => col.field !== "isActive");
    const inactiveColumns = baseColumns;

    const fetchCategories = async () => {
        try {
            const response = await apiService.get("/ProductCategory/hierarchy?includeCategories=true");
            const categoriesArray: CategoryModel[] = response.categories ?? [];

            setActiveCategories(categoriesArray.filter(c => c.isActive));
            setInActiveCategories(categoriesArray.filter(c => !c.isActive));
            setCategories(categoriesArray);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            setActiveCategories([]);
            setInActiveCategories([]);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const saveCategories = async (
        updatedCategories: CategoryModel[],
        isActiveTab: boolean
    ): Promise<void> => {
        try {
            // Save categories via API
            await apiService.post("/ProductCategory/bulk", updatedCategories);

            // Fetch the latest categories
            const response = await apiService.get("/ProductCategory/hierarchy?includeCategories=true");
            const latestCategories: CategoryModel[] = response.categories ?? [];

            // Update frontend state
            setActiveCategories(latestCategories.filter(c => c.isActive));
            setInActiveCategories(latestCategories.filter(c => !c.isActive));
            setCategories(latestCategories);
        } catch (error) {
            console.error("Failed to save categories", error);
        }
    };

    // ✅ Make handlers async and await save
    const onActiveSave = async (updated: CategoryModel[]) => {
        const updatedWithActive = updated.map(c => ({ ...c, isActive: true }));
        await saveCategories(updatedWithActive, true);
    };

    const onInactiveSave = async (updated: CategoryModel[]) => {
        await saveCategories(updated, false);
    };

    const onActiveDelete = async (toDelete: CategoryModel[]) => {
         const updatedWithActive = toDelete.map(c => ({ ...c, isActive: false }));
        await saveCategories(updatedWithActive, true);
    }

    return (
        <div className="p-3">
            <h2 className="mb-4 text-lg font-semibold">🧩 Category Management</h2>

            <TabView>
                <TabPanel header={<div className="flex items-center gap-2"><i className="pi pi-check-circle text-green-500" />Active</div>}>
                    <TTypedDatatable<CategoryModel>
                        columns={activeColumns}
                        data={activeCategories.map(c => ({ ...c, isActive: true }))}
                        primaryKey="categoryId"
                        onSave={onActiveSave}
                        onDelete={onActiveDelete}
                    />
                </TabPanel>

                <TabPanel header={<div className="flex items-center gap-2"><i className="pi pi-times-circle text-red-500" />Inactive</div>}>
                    <TTypedDatatable<CategoryModel>
                        columns={inactiveColumns}
                        data={inactiveCategories}
                        primaryKey="categoryId"
                        onSave={onInactiveSave}
                    />
                </TabPanel>
            </TabView>
        </div>
    );
}
