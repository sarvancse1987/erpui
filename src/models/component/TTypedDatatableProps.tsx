import { ShipmentModel } from "../shipment/ShipmentModel";
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
        brokerageAmount?: number;
    }) => void;
    sortableColumns?: (keyof T)[];
    savedAdjustments?: Record<number, number | undefined>;
    onShipment?: (updatedData: T[]) => void;
    shipmentInfo?: ShipmentModel | null;
    page: string;
    isAddNew: boolean;
}

export interface TTypeDatatableProps<T extends Record<string, any>> {
    columns: ColumnMeta<T>[];
    data: T[];
    primaryKey: keyof T;
    sortableColumns?: (keyof T)[];
    onSave?: (updatedData: T[]) => void;
    onDelete?: (updatedData: T[]) => void;
    onAdd?: () => void;
    onEdit?: (updatedData: T) => void;
    onEditMultiple?: (updatedData: T[]) => void;
    parentSelectedRows?: any[];
    paginator?: boolean;
    rows?: number;
    rowsPerPageOptions?: number[];
    showFilters?: boolean;
    isNew?: boolean;
    isSave?: boolean;
    isEdit?: boolean;
    isDelete?: boolean;
    isSearch?: boolean;
    page?: string;
    showDateFilter?: boolean;
    showDdlFilter?: boolean;
    footerValue?: any;
}