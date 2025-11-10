import { GroupModel } from "./GroupModel";

export interface CategoryModel {
    categoryId: number;
    categoryName: string;
    categoryDescription?: string;
    createdAt: Date;
    isActive: boolean;
    groups?: GroupModel[];
}