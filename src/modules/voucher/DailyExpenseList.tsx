import { TabPanel, TabView } from "primereact/tabview";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { DailyExpenseModel } from "../../models/voucher/DailyExpenseModel";
import { Sidebar } from "primereact/sidebar";
import { useEffect, useState } from "react";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { DailyExpenseForm } from "./DailyExpenseForm";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";
import { ExpenseCategoryEnum } from "../../models/voucher/ExpenseCategoryEnum";

export default function DailyExpenseList() {
    const { showSuccess, showError } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dailyExpense, setDailyExpense] = useState<any[]>([]);
    const [newExpense, setNewExpense] = useState<DailyExpenseModel[]>([]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<DailyExpenseModel>();

    const columns: ColumnMeta<DailyExpenseModel>[] = [
        { field: "dailyExpenseId", header: "ID", editable: false, hidden: true },
        { field: "expenseCategoryId", header: "ID", editable: false, hidden: true },
        { field: "employeeId", header: "ID", editable: false, hidden: true },
        { field: "expenseCategoryName", header: "Expense Name", width: "160px", frozen: true },
        { field: "expenseDate", header: "Date", width: "80px" },
        { field: "expenseTime", header: "Time", width: "90px" },
        {
            field: "amount", header: "Received Amt", width: "90px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.amount)}
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
        { field: "createdByName", header: "Created By", width: "90px" },
        { field: "employeeName", header: "Employee Name", width: "90px" },
    ];

    const formatLocalDateTime = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");

        return (
            date.getFullYear() + "-" +
            pad(date.getMonth() + 1) + "-" +
            pad(date.getDate()) + " " +
            pad(date.getHours()) + ":" +
            pad(date.getMinutes()) + ":" +
            pad(date.getSeconds())
        );
    };

    const formatDateOnly = (date: Date) =>
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");

    const getLast30DaysRange = () => {
        const toDate = new Date();                  // LOCAL NOW
        const fromDate = new Date(toDate);
        fromDate.setDate(toDate.getDate() - 30);
        fromDate.setHours(0, 0, 0, 0);

        return {
            fromDate: formatDateOnly(fromDate),     // yyyy-MM-dd
            toDate: formatLocalDateTime(toDate),    // yyyy-MM-dd HH:mm:ss (LOCAL)
            isActive: true
        };
    };


    const loadCategories = async () => {
        const res = await apiService.get("/DailyExpense/expensecategorytypes");
        const categoryOptions = (res ?? []).map((pt: any) => ({
            label: pt.categoryName,
            value: pt.expenseCategoryId
        }));
        setCategories(categoryOptions ?? []);
    };

    const loadDailyExpenses = async () => {
        const params = getLast30DaysRange();
        const res = await apiService.getQueryParam("/DailyExpense/dailyexpensecategory", params);
        if (res) {
            setDailyExpense(res.dailyExpense);
        }
    };

    const loadUsers = async () => {
        const res = await apiService.get("/Users");
        if (res) {
            const userData = res.map((u: any) => ({
                value: u.id,
                label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
            }));
            setUsers(userData);
        }
    };

    useEffect(() => {
        loadCategories();
        loadDailyExpenses();
        loadUsers()
    }, [])

    const handleOpenEdit = (editedData: DailyExpenseModel) => {
        setIsSidebarOpen(true);
        setSelectedExpense(editedData);
    }

    const handleOnDelete = async (rows: DailyExpenseModel[]) => {
        try {
            const ids = rows.map((r) => r.dailyExpenseId);
            await apiService.post("/DailyExpense/bulk-delete", ids);
            showSuccess("Daily expense(s) deleted successfully!");
            await loadDailyExpenses();
        } catch (err) {
            console.error(err);
            showError("Error deleting daily expenses");
        }
    };

    const createEmptyExpense = (): DailyExpenseModel => ({
        dailyExpenseId: 0,
        expenseDate: new Date(),
        expenseCategoryName: "",
        expenseCategoryId: 0,
        employeeId: 0,
        employeeName: "",
        amount: 0.00,
        remarks: "",
        isApproved: false
    });

    const addNewExpense = () => {
        setNewExpense((prev) => [createEmptyExpense(), ...prev]);
    }

    const isEmployeeRequired = (categoryId: number): boolean => {
        const category = categories.find(c => c.value === categoryId);
        return category?.label === ExpenseCategoryEnum.DailyWagesSalary;
    };

    const handleSaveExpense = async () => {
        const errors: Record<string, string> = {};

        newExpense.forEach((c, idx) => {
            if (!c.expenseDate)
                errors[`expense-${idx}-expenseDate`] = "Expense date required";
            if (c.expenseCategoryId == 0)
                errors[`expense-${idx}-expenseCategoryId`] = "Expense category required";
            if (c.amount == 0)
                errors[`expense-${idx}-amount`] = "Expense amount required";

            if (isEmployeeRequired(c.expenseCategoryId) && !c.employeeId) {
                errors[`expense-${idx}-employeeId`] = "Employee required";
            }
        });

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            const response = await apiService.post("/DailyExpense/bulk", newExpense);
            if (response && response.status) {
                showSuccess("Daily expense's saved successfully!");
                setActiveIndex(0);
            } else {
                showError("Daily expense save failed");
            }
        } catch (err) {
            console.error(err);
            showError("Daily expense save failed");
        }
    }

    const handleUpdateNewExpense = (index: number, updated: DailyExpenseModel) => {
        setNewExpense((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };

    const handleRemoveNewExpense = (index: number) => {
        setNewExpense((prev) => prev.filter((_, i) => i !== index));
    };



    const handleUpdateExpense = async (updated: DailyExpenseModel) => {
        try {
            const response = await apiService.put(`/DailyExpense/${updated.dailyExpenseId}`, updated);
            if (response) {
                showSuccess("Customer updated successfully!");
                setIsSidebarOpen(false);
                loadDailyExpenses();
            }
        } catch (err) {
            console.error(err);
            showError("Error updating customer");
        }
    }

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">🧾 Expense Management</h2>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-shopping-cart" />
                        <span>Expenses</span>
                    </div>
                }>
                    <TTypeDatatable<DailyExpenseModel>
                        data={dailyExpense}
                        columns={columns}
                        primaryKey="dailyExpenseId"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        onDelete={handleOnDelete}
                        isNew={false}
                        isEdit={true}
                        isSave={false}
                        page="dailyexpense"
                        showDateFilter={true}
                        showDdlFilter={true}
                    />
                </TabPanel>

                <TabPanel header={
                    <div className="flex items-center gap-2" style={{ color: '#4083f2' }}>
                        <i className="pi pi-plus-circle" />
                        <span>Add New</span>
                    </div>
                }>
                    <div className="flex gap-2 mb-4">
                        <Button label="Add" icon="pi pi-plus" outlined onClick={addNewExpense} className="p-button-info custom-xs" />
                        {newExpense.length > 0 && (<Button label="Save" icon="pi pi-save" onClick={handleSaveExpense} className="p-button-sm custom-xs" />)}
                    </div>

                    {newExpense.length === 0 ? (
                        <p className="text-gray-500">Click “Add” to create.</p>
                    ) : (
                        newExpense.map((c, idx) => (
                            <DailyExpenseForm
                                key={idx}
                                expense={c}
                                index={idx}
                                onSave={(updated) => handleUpdateNewExpense(idx, updated)}
                                onCancel={() => handleRemoveNewExpense(idx)}
                                validationErrors={validationErrors}
                                isEditSidebar={false}
                                categories={categories}
                                users={users}
                            />
                        ))
                    )}
                </TabPanel>

            </TabView>

            <Sidebar visible={isSidebarOpen}
                position="right"
                onHide={() => setIsSidebarOpen(false)}
                header="Edit Expense"
                style={{ width: '70rem' }}>
                {selectedExpense ? (
                    <DailyExpenseForm
                        key={selectedExpense.dailyExpenseId || "edit"}
                        isEditSidebar={true}
                        expense={selectedExpense}
                        onSave={handleUpdateExpense}
                        onCancel={() => { setIsSidebarOpen(false); }}
                        categories={categories}
                        users={users}
                    />
                ) : <p className="p-4 text-gray-500 text-center">Select a sale to edit.</p>}
            </Sidebar>
        </div>
    )
}