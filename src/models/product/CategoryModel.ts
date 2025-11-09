export interface CategoryModel {
    categoryId: number;
    categoryName: string;
    categoryDescription?: string;
    createdAt: Date; // ISO date string
    isActive: boolean;
}