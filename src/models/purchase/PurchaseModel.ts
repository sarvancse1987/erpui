import { PurchaseItemModel } from "./PurchaseItemModel";

export interface PurchaseModel {
    purchaseId: number;
    purchaseName?: string;
    supplierId: number;
    supplierName?: string;
    invoiceNumber: string;
    invoiceAmount: number;
    invoiceDate: string;
    purchaseDate: string;
    totalAmount: number;
    totalGST: number;
    grandTotal: number;
    purchaseTypeId: number;
    paidAmount: number;
    purchaseRefNo?:string;
    remarks?: string;
    isActive: boolean;
    purchaseItems: PurchaseItemModel[];
}