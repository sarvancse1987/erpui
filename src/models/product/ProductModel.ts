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

    filteredGroups?: OptionModel[];
    filteredBrands?: OptionModel[];
}
