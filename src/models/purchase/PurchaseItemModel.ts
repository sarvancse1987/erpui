export interface PurchaseItemModel {
    purchaseItemId: number;
    purchaseId?: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    gstAmount: number;
    total: number;
    grandTotal: number;
    isNew: boolean;
}
