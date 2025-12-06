export interface InventoryModel {
    inventoryId?: number;
    productId: number;
    productName?: string;

    quantity: number;
    reorderLevel: number;
    purchasePrice: number;
    purchaseGST: number;
    isActive: boolean;
    supplierId: number | null;
}
