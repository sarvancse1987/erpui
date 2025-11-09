// src/models/Product.ts
export interface Product {
    id: string;
    name: string;
    productTypeId: number;
    productCategoryId: number;
    primaryUnitId: number;
    description?: string;
    hsncode?: string;
    purchasePrice: number;
    gstPrice: number;
    salePrice: number;
    inventoryId?: number;
    isGSTIncludedInPrice: boolean;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
}
