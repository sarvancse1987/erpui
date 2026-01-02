export interface CompanyLedgerDetailModel {
    companyLedgerId: number;

    transactionDate: string;        // ISO string from API
    transactionOn?: string;         // formatted date (dd-MM-yyyy)

    companyLedgerCategoryId: number;
    companyLedgerCategoryName?: string;

    description?: string;

    debit: number;
    credit: number;

    currentBalance: number;
    runningBalance: number;

    balance?: number;

    paymentMode?: string;

    referenceId?: number;
    referenceType?: string;

    isOpeningEntry: boolean;

    // 🔹 Party Information
    supplierId?: number;
    supplierName?: string;

    customerId?: number;
    customerName?: string;

    employeeId?: number;
    employeeName?: string;

    // 🔹 Audit / Scope
    companyId: number;
    locationId?: number;

    createdAt: string;
    updatedAt?: string;

    createdBy: number;
    updatedBy?: number;

    isActive: boolean;
}
