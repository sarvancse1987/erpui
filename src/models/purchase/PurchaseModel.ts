import { PurchaseItemModel } from "./PurchaseItemModel";

export interface PurchaseModel {
    purchaseId: number;
    supplierId: number;
    supplierName?: string;       // Optional for display
    invoiceNumber?: string;
    invoiceDate: string;         // ISO string
    purchaseDate: string;        // ISO string
    totalAmount: number;
    gstAmount: number;
    grandTotal: number;
    remarks?: string;
    isActive: boolean;
    purchaseItems: PurchaseItemModel[]; // Should always be an array
}