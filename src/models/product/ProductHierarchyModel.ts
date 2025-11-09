import { BrandModel } from "./BrandModel";
import { CategoryModel } from "./CategoryModel";
import { GroupModel } from "./GroupModel";
import { ProductModel } from "./ProductModel";

export interface ProductHierarchyResult {
    Status: boolean;
    Message: string;

    Categories?: CategoryModel[];
    Groups?: GroupModel[];
    Brands?: BrandModel[];
    Products?: ProductModel[];
}
