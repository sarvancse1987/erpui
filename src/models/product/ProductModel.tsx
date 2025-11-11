// src/models/Product.ts
export interface ProductModel {
    productId: number;
    productName: string;
    productDescription?: string;
    hsnCode?: string;
    purchasePrice: number;
    gstPrice: number;
    salePrice: number;
    isGSTIncludedInPrice: boolean;

    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    createdAt: string; // ISO date string from backend
    isActive: boolean;

    productCategoryId: number;
    categoryName?: string;
    categoryDescription?: string;

    productGroupId: number;
    groupName?: string;
    groupDescription?: string;

    productBrandId: number;
    brandName?: string;
    brandDescription?: string;
}
