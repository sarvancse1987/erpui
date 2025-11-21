export interface PurchaseItemModel {
    purchaseItemId: number;
    purchaseId?: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    gstPercent: number;
    amount: number;
    gstAmount: number;
    totalAmount: number;
    isNew: boolean;
    companyId?: number;
    locationId?: number;
    _tempKey?: string;
    _edited?: boolean;
}
