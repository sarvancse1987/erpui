import { OptionModel } from "./OptionModel";

export interface ProductModel {
    productId: number;
    productName: string;
    productDescription?: string;
    hsnCode: string;
    createdAt: string;
    isActive: boolean;

    purchasePrice: number;
    gstPrice: number;
    salePrice: number;
    isGSTIncludedInPrice: boolean;
    cgstRate: number;
    sgstRate: number;
    igstRate?: number;

    primaryUnitId: number;
    unitName?: string;

    // Parent Category + Group + Brand info
    productCategoryId: number;
    categoryName?: string;
    categoryDescription?: string;

    productGroupId: number;
    groupName?: string;
    groupDescription?: string;

    productBrandId: number;
    brandName?: string;
    brandDescription?: string;

    supplierId?: number | undefined;
    supplierName?: string;

    filteredGroups?: OptionModel[];
    filteredBrands?: OptionModel[];

    imageFile?: File | null;
    imagePreviewUrl?: string | null;
    tempKey: string;
    isListOut?: boolean;
}


export interface ProductSearchModel {
    productId: number;
    productName: string;
    hsnCode: string;

    purchasePrice?: number;
    gstPrice?: number;
    salePrice?: number;
    isGSTIncludedInPrice?: boolean;
    cgstRate?: number;
    sgstRate?: number;
    igstRate?: number;

    primaryUnitId?: number;
    unitName?: string;

    productCategoryId?: number;
    categoryName?: string;

    productGroupId?: number;
    groupName?: string;

    productBrandId?: number;
    brandName?: string;

    supplierId?: number;
    inventoryPurchasePrice?: number;
}