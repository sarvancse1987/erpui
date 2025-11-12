export interface ColumnMeta<T> {
    field: keyof T;
    header: string;
    editable?: boolean;
    required?: boolean;
    type?: "text" | "select" | "date" | "checkbox" | "number" | "decimal" | "gst";
    options?: { label: string; value: any }[];
    width?: string;
    frozen?: boolean;
    body?: (rowData: T) => React.ReactNode;
    onValueChange?: (row: T, value: any, tableData: T[], setTableData: React.Dispatch<React.SetStateAction<T[]>>) => void;
    onEdit?: (row: T) => void;
    hidden?: boolean;
    style?: React.CSSProperties;
}