
export interface CustomerLedgerModel {
    customerLedgerId: number;
    customerId: number;
    customerName: string;
    sourceType: string;
    ledgerType: "Dr" | "Cr";
    openingBalance: number;
    credit: number;
    debit: number;
    closingBalance: number;
    lastUpdated: string;
    lastUpdatedTime: string;
}
