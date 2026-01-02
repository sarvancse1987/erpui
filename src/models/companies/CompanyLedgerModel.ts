export interface CompanyLedgerCategory {
    companyLedgerCategoryId: number;
    companyLedgerCategoryName: string;
}

export interface CompanyLedgerModel {
    companyLedgerId: number;
    transactionDate: Date;
    companyLedgerCategoryId: number | null;

    description?: string;
    debit: number;
    credit: number;
    balance?: number;
    paymentMode: string | null;
    referenceId?: number;
    referenceType?: string;
    isOpeningEntry: boolean;
    supplierId?: number;
}
