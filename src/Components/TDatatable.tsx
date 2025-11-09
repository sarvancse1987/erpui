import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import "../asset/style/TDatatable.css";
import { ConfirmDialog } from "primereact/confirmdialog";

interface PaginatorTableProps {
  scrollHeight?: string;
  data: any[];
  hiddenColumns?: string[];
  sortableColumns?: string[];
  rowsPerPage?: number;
  isEdit?: boolean;
  isDelete?: boolean;
  isSearch?: boolean;
  onAdd?: (rowData: any) => void;
  onEditRow?: (rowData: any) => void;
  onDeleteRow?: (rowData: any) => void;
}

const getNestedValue = (obj: any, path: string) => {
  if (!path) return null;
  return path
    .split(".")
    .reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
};

const flattenObject = (obj: any, prefix = ""): Record<string, any> =>
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix ? `${prefix}.${k}` : k;
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre));
    } else {
      acc[pre] = obj[k];
    }
    return acc;
  }, {} as Record<string, any>);

const formatHeader = (field: string): string =>
  field
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const TDatatable: React.FC<PaginatorTableProps> = ({
  scrollHeight = "420px",
  data,
  hiddenColumns = [],
  sortableColumns = [],
  rowsPerPage = 5,
  isEdit = false,
  isDelete = false,
  isSearch,
  onAdd,
  onEditRow,
  onDeleteRow,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState(data);
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<1 | -1 | 0>(1);
  const [filter, setFilter] = useState("");
  const showSearch = isSearch !== false;

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);

  const menuRefs = useRef<Record<number, React.RefObject<Menu>>>({});

  useEffect(() => {
    filterData(filter);
  }, [filter, data]);

  useEffect(() => {
    const refs: Record<number, React.RefObject<Menu>> = {};
    data.forEach((_, idx) => {
      refs[idx] = refs[idx] || React.createRef<Menu>();
    });
    menuRefs.current = refs;
  }, [data]);

  const filterData = (
    filterTerm: string,
    field = sortField,
    order = sortOrder
  ) => {
    const lowercasedFilter = filterTerm.toLowerCase();
    const sorted = [...data].sort((a, b) => {
      const aValue = getNestedValue(a, field);
      const bValue = getNestedValue(b, field);
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === 1
          ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
          : bValue.toLowerCase().localeCompare(aValue.toLowerCase());
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return order === 1 ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    const filtered = sorted.filter((item) =>
      Object.values(flattenObject(item)).some((value) =>
        String(value).toLowerCase().includes(lowercasedFilter)
      )
    );

    setFilteredData(filtered);
  };

  const allKeys = data.length > 0 ? Object.keys(flattenObject(data[0])) : [];
  const visibleFields = allKeys.filter((key) => !hiddenColumns.includes(key));
  const columnWidth = `${100 / (visibleFields.length + 1)}%`;

  const onSort = (e: any) => {
    const { sortField, sortOrder } = e;
    setSortField(sortField);
    setSortOrder(sortOrder);

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortField);
      const bValue = getNestedValue(b, sortField);

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === 1
          ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
          : bValue.toLowerCase().localeCompare(aValue.toLowerCase());
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === 1 ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredData(sortedData);
  };

  const handleMenuToggle = (e: any, rowIndex: any) => {
    const ref = menuRefs.current[rowIndex];
    if (ref?.current) {
      ref.current.toggle(e);
    }
  };

  const handleDeleteClick = (rowData: any) => {
    setRowToDelete(rowData);
    setConfirmVisible(true);
  };

  const acceptDelete = () => {
    if (onDeleteRow && rowToDelete) {
      onDeleteRow(rowToDelete);
    }
    setConfirmVisible(false);
    setRowToDelete(null);
  };

  const rejectDelete = () => {
    setConfirmVisible(false);
    setRowToDelete(null);
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <>
      <div className="grid">
        <div className="col-12 lg:col-12 xl:col-12">
          <div className="card p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 p-3">
              {onAdd && (
                <div className="sm:order-1">
                  <Button
                    label="Add"
                    icon="pi pi-plus"
                    className="p-button-sm custom-small-button"
                    severity="secondary"
                    style={{backgroundColor:'#3827B4'}}
                    raised
                    onClick={onAdd}
                  />
                </div>
              )}

              {showSearch && (
                <div className="w-full sm:w-auto sm:ml-auto">
                  <div className="flex justify-end">
                    <div className="p-inputgroup">
                      <InputText
                        placeholder="Search"
                        className="p-inputtext-sm"
                        value={filter}
                        onChange={(e) =>
                          setFilter((e.target as HTMLInputElement).value)
                        }
                      />
                      <span className="p-inputgroup-addon">
                        <i className="pi pi-search" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DataTable
              scrollable
              scrollHeight={scrollHeight}
              value={filteredData}
              paginator
              rows={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ width: "100%" }}
              paginatorTemplate={
                isMobile
                  ? "PrevPageLink NextPageLink CurrentPageReport"
                  : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              }
              className="custom-datatable p-3"
              onSort={onSort}
              sortField={sortField}
              sortOrder={sortOrder}
              sortMode="single"
              emptyMessage={<span style={{ color: "gray" }}>No record found</span>}
              selectionMode="single"
              size="small"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              {visibleFields.map((field) => (
                <Column
                  key={field}
                  field={field}
                  header={formatHeader(field)}
                  body={(rowData) => getNestedValue(rowData, field)}
                  style={{ width: columnWidth}}
                  sortable={sortableColumns.includes(field)}
                  headerClassName="custom-name-header"
                  
                />
              ))}

              <Column
                header={isEdit || isDelete ? "Actions" : ""}
                body={(rowData, options) => {
                  const rowIndex = options.rowIndex;
                  const ref = menuRefs.current[rowIndex];
                  const items = [];

                  if (isEdit) {
                    items.push({
                      label: "Edit",
                      icon: "pi pi-pencil",
                      command: () => onEditRow?.(rowData),
                    });
                  }

                  if (isDelete) {
                    items.push({
                      label: "Delete",
                      icon: "pi pi-trash",
                      command: () => handleDeleteClick(rowData),
                    });
                  }
                  if (isEdit && isDelete) {
                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "left",
                            alignItems: "left",
                            gap: "4px",
                          }}
                        >
                          <Menu
                            model={items}
                            popup
                            ref={ref}
                            key={`menu_${rowIndex}`}
                          />
                          <Button
                            icon="pi pi-ellipsis-v"
                            className="p-button-text p-button-sm"
                            style={{ padding: "0.2rem 1.2rem" }}
                            onClick={(e) => handleMenuToggle(e, rowIndex)}
                            aria-haspopup
                            aria-controls={`menu_${rowIndex}`}
                            size="small"
                          />
                        </div>
                      </>
                    );
                  }
                }}
                style={{ width: "100px", textAlign: "center" }}
                headerClassName="custom-name-header"
              />
            </DataTable>
          </div>

          <ConfirmDialog
            group="declarative"
            visible={confirmVisible}
            onHide={() => setConfirmVisible(false)}
            message="Are you sure you want to delete this record?"
            header="Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={acceptDelete}
            reject={rejectDelete}
            style={{ width: "50vw" }}
            breakpoints={{ "1100px": "75vw", "960px": "100vw" }}
          />
        </div>
      </div>
    </>
  );
};

export default TDatatable;
