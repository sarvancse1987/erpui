import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import ReactDOM from "react-dom";

interface TDatatableProps {
  data: any[];
  hiddenColumns?: string[];
  sortableColumns?: string[];
  rowsPerPage?: number;
  isEdit?: boolean;
  isDelete?: boolean;
  isSearch?: boolean;
  onAdd?: () => void;
  onEditRow?: (rowData: any) => void;
  onDeleteRow?: (rowData: any) => void;
}

const getNestedValue = (obj: any, path: string) => {
  if (!path) return null;
  return path.split(".").reduce((o, k) => (o ? o[k] : null), obj);
};

const formatHeader = (field: string): string =>
  field
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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

const DropdownPortal: React.FC<{
  position: { top: number; left: number };
  children: ReactNode;
}> = ({ position, children }) => {
  return ReactDOM.createPortal(
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 1000,
        background: "#fff",
        border: "1px solid #ccc",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: 4,
        minWidth: 100,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

const TDatatableHtml: React.FC<TDatatableProps> = ({
  data,
  hiddenColumns = [],
  sortableColumns = [],
  rowsPerPage = 5,
  isEdit = false,
  isDelete = false,
  isSearch = true,
  onAdd,
  onEditRow,
  onDeleteRow,
}) => {
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<1 | -1 | 0>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(rowsPerPage);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Keep refs to all action buttons (to calculate dropdown position)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Ref for dropdown container to detect outside clicks
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Prepare filtered + sorted data
  const processedData = useMemo(() => {
    let filtered = data.filter((item) =>
      Object.values(flattenObject(item))
        .map((v) => (v !== null && v !== undefined ? String(v) : ""))
        .join(" ")
        .toLowerCase()
        .includes(filter.toLowerCase())
    );

    if (sortField) {
      filtered = filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortField);
        const bValue = getNestedValue(b, sortField);

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === 1
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === 1 ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, filter, sortField, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close menu if click outside both button and dropdown
      if (
        openMenuIndex !== null &&
        buttonRefs.current[openMenuIndex] &&
        !buttonRefs.current[openMenuIndex]?.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenuIndex(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIndex]);

  const allKeys = data.length > 0 ? Object.keys(flattenObject(data[0])) : [];
  const visibleFields = allKeys.filter((key) => !hiddenColumns.includes(key));

  const totalPages = Math.ceil(processedData.length / pageSize);
  const pageData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const onSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 1 ? -1 : 1);
    } else {
      setSortField(field);
      setSortOrder(1);
    }
  };

  const handleDelete = (rowData: any) => {
    if (onDeleteRow) onDeleteRow(rowData);
  };

  const handleEdit = (rowData: any) => {
    if (onEditRow) onEditRow(rowData);
  };

  // When clicking the button, save index and calculate dropdown position
  const onActionClick = useCallback(
    (idx: number) => {
      if (openMenuIndex === idx) {
        // Close if clicking the same button
        setOpenMenuIndex(null);
        setDropdownPosition(null);
        return;
      }

      const btn = buttonRefs.current[idx];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
        setOpenMenuIndex(idx);
      }
    },
    [openMenuIndex]
  );

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: 16,
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {onAdd ? (
          <button
            onClick={onAdd}
            style={{
              padding: "7px 10px 7px 10px",
              background: "#3827b4",
              color: "white",
              borderRadius: "8px",
              fontWeight: "700",
            }}
          >
            <i className="pi pi-plus px-2"> </i> Add
          </button>
        ) : (
          <div style={{ width: 75 }} /> // Empty space to keep layout aligned
        )}

        {isSearch && (
          <input
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: 8,
              minWidth: 200,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        )}
      </div>

      {/* Table Scroll Wrapper */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                {visibleFields.map((field) => (
                  <th
                    key={field}
                    onClick={() =>
                      sortableColumns.includes(field)
                        ? onSort(field)
                        : undefined
                    }
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#9872d5",
                      zIndex: 1,
                      cursor: sortableColumns.includes(field)
                        ? "pointer"
                        : "default",
                      borderBottom: "1px solid #ddd",
                      padding: 8,
                      width: `${100 / (visibleFields.length + 1)}%`,
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    {formatHeader(field)}
                    {sortField === field
                      ? sortOrder === 1
                        ? " ▲"
                        : " ▼"
                      : null}
                  </th>
                ))}
                {(isEdit || isDelete) && (
                  <th
                    style={{
                      width: "60px",
                      maxWidth: "60px",
                      minWidth: "60px",
                      position: "sticky",
                      top: 0,
                      right: 0,
                      backgroundColor: "#9872d5",
                      zIndex: 3,
                      padding: 8,
                      borderBottom: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      visibleFields.length + (isEdit || isDelete ? 1 : 0)
                    }
                    style={{ padding: 10, textAlign: "center", color: "gray" }}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                pageData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    {visibleFields.map((field) => (
                      <td key={field} style={{ padding: 8, fontWeight: 500 }}>
                        {String(getNestedValue(row, field) ?? "")}
                      </td>
                    ))}
                    {(isEdit || isDelete) && (
                      <td
                        style={{
                          padding: 8,
                          position: "sticky",
                          right: 0,
                          background: "#fff",
                          zIndex: 1,
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <button
                          ref={(el: any) => (buttonRefs.current[idx] = el)}
                          onClick={() => onActionClick(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: 18,
                          }}
                          aria-label="Open action menu"
                        >
                          ⋮
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{padding:"6px"}}
          >
            Prev
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
              style={{padding:"6px"}}
          >
            Next
          </button>
        </div>

        <div>
          <label
            style={{
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Showing 1 to 10 of 40 entries{" "}
            <select
              value={pageSize}
              style={{
                padding: "11px",
                borderRadius: "5px",
                color: "#6b7280",
                border: "1px solid #808080",
                fontWeight: 500,
              }}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Dropdown Menu Portal */}
      {openMenuIndex !== null && dropdownPosition && (
        <DropdownPortal position={dropdownPosition}>
          <div ref={dropdownRef}>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: "4px 0",
                minWidth: 100,
                userSelect: "none",
              }}
            >
              {isEdit && (
                <li>
                  <button
                    onClick={() => {
                      handleEdit(pageData[openMenuIndex]);
                      setOpenMenuIndex(null);
                      setDropdownPosition(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "6px 12px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                </li>
              )}
              {isDelete && (
                <li>
                  <button
                    onClick={() => {
                      handleDelete(pageData[openMenuIndex]);
                      setOpenMenuIndex(null);
                      setDropdownPosition(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "6px 12px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "red",
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </li>
              )}
            </ul>
          </div>
        </DropdownPortal>
      )}
    </div>
  );
};

export default TDatatableHtml;
