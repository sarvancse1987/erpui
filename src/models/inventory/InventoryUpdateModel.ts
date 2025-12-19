export interface InventoryUpdateModel {
    inventoryId: number;
    productId: number;

    availableQuantity: number;
    salePrice: number;
    isActive: boolean;
    supplierId: number | null;
    previousPurchasePrice?: number;
    inventorySupplierId?: number;
}
