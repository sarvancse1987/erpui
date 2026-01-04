import { TabPanel, TabView } from "primereact/tabview";
import { useEffect, useState } from "react";
import { CompanyLedgerModel } from "../../models/companies/CompanyLedgerModel";
import DailyBookForm from "./DailyBookForm";
import apiService from "../../services/apiService";
import { CompanyLedgerDetailModel } from "../../models/companies/CompanyLedgerDetailModel";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { Tag } from "primereact/tag";
import { Sidebar } from "primereact/sidebar";

export default function DailyBookList() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedLedger, setSelectedLedger] = useState<CompanyLedgerModel | null>(null);
    const [ledgers, setLedgers] = useState<CompanyLedgerDetailModel[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        };
    };

    const loadData = async () => {
        const params = getLast30DaysRange();
        const res = await apiService.getQueryParam("/CompanyLedger/GetCompanyLedgerDetails", params);
        const data = res?.companyLedgerDtoList ?? [];
        setLedgers(data);
    }

    useEffect(() => {
        loadData();
    }, []);

    const columns: ColumnMeta<CompanyLedgerDetailModel>[] = [
        { field: "companyLedgerId", header: "ID", editable: false, hidden: true },
        { field: "transactionOn", header: "Date", width: "80px" },
        { field: "companyLedgerCategoryId", header: "ID", editable: false, hidden: true },
        { field: "companyLedgerCategoryName", header: "Expense Name", width: "160px", frozen: true },
        {
            field: "debit", header: "Debited Amt", width: "90px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.debit)}
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
            field: "credit", header: "Crited Amt", width: "90px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.credit)}
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
        { field: "supplierName", header: "Supplier Name", width: "90px" },
        { field: "customerName", header: "Customer Name", width: "90px" },
        { field: "employeeName", header: "Employee Name", width: "90px" },
    ];

    const handleOpenEdit = (editedData: any) => {
        setIsSidebarOpen(true);
        setSelectedLedger(editedData);
    }

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">🧾 Company Ledger Management</h2>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <i className="pi pi-file-edit" />
                        <span>Company Vouchers</span>
                    </div>
                }>
                    <TTypeDatatable<CompanyLedgerDetailModel>
                        data={ledgers}
                        columns={columns}
                        primaryKey="companyLedgerId"
                        onEdit={handleOpenEdit}
                        isDelete={true}
                        //onDelete={handleOnDelete}
                        isNew={false}
                        isSave={false}
                        page="companyledger"
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
                    <div className="space-y-4">
                        <DailyBookForm isEditSidebar={false} onSave={() => { loadData(); setActiveIndex(0) }} />
                    </div>
                </TabPanel>

            </TabView>


            <Sidebar visible={isSidebarOpen}
                position="right"
                onHide={() => setIsSidebarOpen(false)}
                header="Edit Company Ledger"
                style={{ width: '70rem' }}>
                {selectedLedger ? (
                    <DailyBookForm isEditSidebar={true} onSave={() => {
                        loadData();
                        setActiveIndex(0);
                        setIsSidebarOpen(false)
                    }}
                        onCancel={() =>
                            setIsSidebarOpen(false)
                        }
                        editedData={selectedLedger} />
                ) : <p className="p-4 text-gray-500 text-center">Select a ledger to edit.</p>}
            </Sidebar>

        </div>
    )
}