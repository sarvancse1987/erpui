import { PurchaseItemModel } from "./PurchaseItemModel";

export interface PurchaseModel {
    purchaseId: number;
    purchaseName?: string;
    supplierId: number;
    supplierName?: string;
    invoiceNumber: string;
    invoiceAmount: number;
    invoiceDate: string | Date | null;
    purchaseDate: string | Date | null;
    totalAmount: number;
    totalGST: number;
    grandTotal: number;
    purchaseTypeId: number;
    paidAmount: number;
    purchaseRefNo?: string;
    remarks?: string;
    isActive: boolean;
    purchaseTypeName?: string;
    balanceAmount?: number;
    runningBalance?: number;
    freightAmount?: number;
    roundOff?: number;
    companyId?: number;
    locationId?: number;
    purchaseItems: PurchaseItemModel[];
}