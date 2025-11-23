import { ColumnMeta } from "./ColumnMeta";

export interface TTypedDatatableProps<T extends Record<string, any>> {
    columns: ColumnMeta<T>[];
    data: T[];
    primaryKey: keyof T;
    onSave?: (updatedData: T[]) => void;
    onDelete?: (updatedData: T[]) => void;
    onEdit?: (updatedData: T[]) => void;
    paginator?: boolean;
    rows?: number;
    rowsPerPageOptions?: number[];
    showFilters?: boolean;
    isNew?: boolean;
    isSave?: boolean;
    isDelete?: boolean;
    itemsSaveTrigger?: number;
    onChange?: (updatedData: T[]) => void;
    onAdjustmentsChange?: (adjustments: {
        freightAmount?: number;
        roundOff: number;
    }) => void;
    sortableColumns?: (keyof T)[];
}

export interface TTypeDatatableProps<T extends Record<string, any>> {
    columns: ColumnMeta<T>[];
    data: T[];
    primaryKey: keyof T;
    sortableColumns?: (keyof T)[];
    onSave?: (updatedData: T[]) => void;
    onDelete?: (updatedData: T[]) => void;
    onEdit?: (updatedData: T) => void;
    paginator?: boolean;
    rows?: number;
    rowsPerPageOptions?: number[];
    showFilters?: boolean;
    isNew?: boolean;
    isSave?: boolean;
    isDelete?: boolean;
}