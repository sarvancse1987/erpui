export interface PurchaseItemModel {
    purchaseItemId: number;
    purchaseId?: number;       // Optional for new items
    productId: number;
    productName: string;
    quantity: number;
    unitId: number;
    unitPrice: number;
    gstRate: number;
    gstAmount: number;
    total: number;
    hsnCode?: string;
}
