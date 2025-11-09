export interface ProductModel {
    ProductId: number;
    ProductName: string;
    ProductDescription?: string;
    HsnCode?: string;
    CreatedAt: string;
    IsActive: boolean;

    PurchasePrice: number;
    GstPrice: number;
    SalePrice: number;
    IsGSTIncludedInPrice: boolean;
    CGSTRate: number;
    SGSTRate: number;
    IGSTRate: number;

    // Parent Category + Group + Brand info
    ProductCategoryId: number;
    CategoryName: string;
    CategoryDescription?: string;

    ProductGroupId: number;
    GroupName: string;
    GroupDescription?: string;

    ProductBrandId: number;
    BrandName: string;
    BrandDescription?: string;
}
