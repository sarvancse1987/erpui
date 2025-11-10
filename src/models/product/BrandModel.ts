export interface BrandModel {
    brandId: number;
    brandName: string;
    brandDescription?: string;
    createdAt: string;
    isActive: boolean;

    // Parent Category + Group info
    categoryId: number;
    categoryName: string;
    categoryDescription?: string;

    groupId: number;
    groupName: string;
    groupDescription?: string;
}
