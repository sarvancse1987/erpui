import { ColumnMeta } from "./ColumnMeta";

export interface TTypedDatatableProps<T extends Record<string, any>> {
    columns: ColumnMeta<T>[];
    data: T[];
    primaryKey: keyof T;
    onSave?: (updatedData: T[]) => void;
}

export interface TTypeDatatableProps<T extends Record<string, any>> {
    columns: ColumnMeta<T>[];
    data: T[];
    primaryKey: keyof T;
}