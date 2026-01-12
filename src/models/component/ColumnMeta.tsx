export interface ColumnMeta<T> {
    field: keyof T;
    header: string;
    editable?: boolean;
    required?: boolean;
    type?: "text" | "select" | "selectsearch" | "date" | "checkbox" | "number" | "decimal" | "currency" | "textdisabled" | "gst" | "productSearch" | "input" | "inputdisabled";
    options?: { label: string; value: any }[];
    width?: string;
    frozen?: boolean;
    body?: (rowData: T) => React.ReactNode;
    onValueChange?: (row: T, value: any, tableData: T[], setTableData: React.Dispatch<React.SetStateAction<T[]>>) => void;
    onEdit?: (row: T) => void;
    hidden?: boolean;
    style?: React.CSSProperties;
    editor?: (options: {
        rowData: T;
        value: any;
        field: keyof T;
        editorCallback: (value: any) => void;
        column: ColumnMeta<T>;
    }) => React.ReactNode;
    placeholder?: string;
    exportValue?: (rowData: any) => string | number;
}