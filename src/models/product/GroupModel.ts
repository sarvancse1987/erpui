import { BrandModel } from "./BrandModel";

export interface GroupModel {
  groupId: number;
  groupName: string;
  groupDescription?: string;
  createdAt: string;
  isActive: boolean;

  // Parent Category info
  categoryId: number;
  categoryName?: string;
  categoryDescription?: string;

  brands?: BrandModel[];
}
