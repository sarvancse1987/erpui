import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypedDatatable } from "../../components/TTypedDatatable";
import apiService from "../../services/apiService";
import { CategoryModel } from "../../models/product/CategoryModel";
import { useToast } from "../../components/ToastService";
import { Sidebar } from "primereact/sidebar";
import { CategoryGroupBrandForm } from "./CategoryGroupBrandForm";
import { Button } from "primereact/button";

export default function Category() {
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [editedCategories, setEditedCategories] = useState<any[]>([]);
    const [activeCategories, setActiveCategories] = useState<CategoryModel[]>([]);
    const [inactiveCategories, setInActiveCategories] = useState<CategoryModel[]>([]);
    const { showSuccess, showError } = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const baseColumns: ColumnMeta<CategoryModel>[] = [
        { field: "categoryId", header: "ID", editable: false, hidden: true },
        { field: "categoryName", header: "Category Name", editable: true, required: true, placeholder: "Category name" },
        { field: "categoryDescription", header: "Description", editable: true, placeholder: "Description" },
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
        isActiveTab: boolean,
        isDeleted: boolean
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
            if (!isDeleted)
                showSuccess("Categories saved successfully!");
            else
                showSuccess("Categories deleted successfully!");
        } catch (error) {
            console.error("Failed to save categories", error);
            showError("Error saving categories. Please try again.");
        }
    };

    // ✅ Make handlers async and await save
    const onActiveSave = async (updated: CategoryModel[]) => {
        const updatedWithActive = updated.map(c => ({ ...c, isActive: true }));
        await saveCategories(updatedWithActive, true, false);
    };

    const onInactiveSave = async (updated: CategoryModel[]) => {
        await saveCategories(updated, false, false);
    };

    const onActiveDelete = async (toDelete: CategoryModel[]) => {
        const updatedWithActive = toDelete.map(c => ({ ...c, isActive: false }));
        await saveCategories(updatedWithActive, true, true);
    }

    const add = () => {
        setSidebarVisible(true);
    }

    const onCancel = () => {
        setSidebarVisible(false);
    }

    const onSave = () => {
        fetchCategories();
        setSidebarVisible(false);
    }

    const onEdit = (rows: any) => {
        setEditedCategories([rows]);
        setSidebarVisible(true);
    }

    const onEditMultiple = (rows: any[]) => {
        setEditedCategories(rows);
        setSidebarVisible(true);
    }

    return (
        <div className="p-2">
            <h2 className="mb-1 text-lg font-semibold">🧩 Category Management</h2>

            <TabView>
                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'green' }}>
                        <i className="pi pi-check-circle" />
                        <span>Active</span>
                    </div>}>
                    <TTypedDatatable<CategoryModel>
                        columns={activeColumns}
                        data={activeCategories.map(c => ({ ...c, isActive: true }))}
                        primaryKey="categoryId"
                        onSave={onActiveSave}
                        onDelete={onActiveDelete}
                        onAdd={add}
                        onEdit={onEdit}
                        onEditMultiple={onEditMultiple}
                        isNew={true}
                        isSave={true}
                        isEdit={true}
                        isDelete={true}
                        sortableColumns={['categoryName']}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: 'red' }}>
                        <i className="pi pi-times-circle" />
                        <span>Inactive</span>
                    </div>}>
                    <TTypedDatatable<CategoryModel>
                        columns={inactiveColumns}
                        data={inactiveCategories}
                        primaryKey="categoryId"
                        onSave={onInactiveSave}
                        isNew={true}
                        isSave={true}
                        isDelete={true}
                    />
                </TabPanel>
            </TabView>

            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                style={{ width: '35rem', height: '100%' }}
                showCloseIcon={true}
                header="Add Category"
            >
                <CategoryGroupBrandForm type="CATEGORY" onCancel={onCancel} onSave={onSave} editedRow={editedCategories} />
            </Sidebar>
        </div>
    );
}
