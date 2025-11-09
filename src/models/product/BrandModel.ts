export interface BrandModel {
    BrandId: number;
    BrandName: string;
    BrandDescription?: string;
    CreatedAt: string;
    IsActive: boolean;

    // Parent Category + Group info
    CategoryId: number;
    CategoryName: string;
    CategoryDescription?: string;

    GroupId: number;
    GroupName: string;
    GroupDescription?: string;
}
