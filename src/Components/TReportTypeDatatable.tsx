import React, { useEffect, useMemo, useState } from "react";
import {
  DataTable,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { TTypeDatatableProps } from "../models/component/TTypedDatatableProps";
import { FilterMatchMode } from "primereact/api";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import PurchaseFooterBox from "../modules/purchase/PurchaseFooterBox";
import { MultiSelect } from "primereact/multiselect";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import as a function

export function TReportTypeDatatable<T extends Record<string, any>>({
  columns,
  data,
  primaryKey,
  isDelete,
  onDelete,
  sortableColumns = [],
  page,
  showDateFilter = false,
  showDdlFilter = false
}: TTypeDatatableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(Array.isArray(data) ? data : []);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [ddlFilterValues, setDdlFilterValues] = useState<any[]>([]);
  const [isDdlFiltered, setIsDdlFiltered] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);


  useEffect(() => {
    const f: any = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
    columns.forEach((c) => {
      f[c.field] = { value: null, matchMode: FilterMatchMode.CONTAINS };
    });
    setFilters(f);
  }, [columns]);

  useEffect(() => {
    setTableData(Array.isArray(data) ? data.map(d => ({ ...d })) : []);
    setOriginalData(Array.isArray(data) ? data.map(d => ({ ...d })) : [])
  }, [data]);


  const handleDelete = () => {
    if (selectedRows.length === 0) return;

    confirmDialog({
      message: "Are you sure you want to delete the selected record(s)?",
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",
      acceptClassName: "p-button-danger p-button-sm",
      rejectClassName: "p-button-secondary p-button-sm",

      accept: () => {
        const remainingRows = tableData.filter(
          (row) => !selectedRows.some((sel) => sel[primaryKey] === row[primaryKey])
        );

        if (onDelete) onDelete(selectedRows);
        setTableData(remainingRows);
      },
    });
  };

  const totals = useMemo(() => {
    return tableData.reduce(
      (acc, row) => {
        const invoice = row.invoiceAmount ?? 0;
        const cash = row.cash ?? 0;
        const upi = row.upi ?? 0;
        const paid = cash + upi;
        const balance = invoice - paid;

        acc.invoiceAmount += invoice;
        acc.paidAmount += paid;
        acc.balanceAmount += balance;
        acc.runningAmount += row.runningBalance ?? 0;
        acc.gstAmount += row.totalGST ?? 0;
        acc.grandTotal += row.grandTotal ?? 0;

        return acc;
      },
      {
        invoiceAmount: 0,
        paidAmount: 0,
        balanceAmount: 0,
        runningAmount: 0,
        gstAmount: 0,
        grandTotal: 0
      }
    );
  }, [tableData]);

  const saleTotals = useMemo(() => {
    return tableData.reduce(
      (acc, row: any) => {
        const cash = row.cash ?? 0;
        const upi = row.upi ?? 0;
        const paid = cash + upi;

        acc.grandTotal += row.grandTotal ?? 0;
        acc.paidAmount += paid;
        acc.balanceAmount += row.balanceAmount ?? 0;
        acc.runningAmount += row.runningBalance ?? 0;

        return acc;
      },
      {
        grandTotal: 0,
        paidAmount: 0,
        balanceAmount: 0,
        runningAmount: 0,
      }
    );
  }, [tableData]);


  const ledgerTotals = useMemo(() => {
    return tableData.reduce(
      (acc, row: any) => {
        const debit = row.debit ?? 0;
        const credit = row.credit ?? 0;

        acc.totalSale += debit + credit;
        acc.totalReceived += credit;
        acc.balanceAmount += debit;

        return acc;
      },
      {
        totalSale: 0,
        totalReceived: 0,
        balanceAmount: 0,
      }
    );
  }, [tableData]);

  const getDdlFilterField = (row: any) => {
    if (page === "purchase") return row.supplierId;
    if (page === "sale") return row.customerId;
    if (page === "quotation") return row.customerId;
    if (page === "voucher") return row.customerId;
    if (page === "dailyexpense") return row.expenseCategoryId;
    if (page === "customerledge") return row.customerId;
    return null;
  };

  const getDdlFilterLabel = (row: any) => {
    if (page === "purchase") return row.supplierName;
    if (page === "sale") return row.customerName;
    if (page === "quotation") return row.customerName;
    if (page === "voucher") return row.customerName;
    if (page === "dailyexpense") return row.expenseCategoryName;
    if (page === "customerledge") return row.customerName;
    return "";
  };

  const ddlOptions = useMemo(() => {
    const map = new Map<any, string>();

    originalData.forEach((row: any) => {
      const value = getDdlFilterField(row);
      const label = getDdlFilterLabel(row); // optional

      if (value != null && !map.has(value)) {
        map.set(value, label ?? String(value));
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label
    }));
  }, [originalData, page]);

  const formatINR = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2
    }).format(value);

  const tableFooter =
    page === "purchase" ? (
      <div className="custom-footer flex justify-between items-center gap-1 flex-wrap px-2 py-1">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Paid Amount */}
          <PurchaseFooterBox
            label="Paid Amt"
            value={formatINR(totals.paidAmount)}
            bg="#22c55e"
          />

          {/* Balance Amount */}
          <PurchaseFooterBox
            label="Balance Amt"
            value={formatINR(totals.balanceAmount)}
            bg="#be5744ff"
          />

          {/* GST Amount */}
          <PurchaseFooterBox
            label="GST Amt"
            value={formatINR(totals.gstAmount)}
            bg="#dbb434ff"
          />

          {/* Grand Total */}
          <PurchaseFooterBox
            label="Grand Total"
            value={formatINR(totals.grandTotal)}
          />

        </div>
      </div>
    ) : page === "sale" ? (
      <div className="custom-footer flex justify-between items-center gap-1 flex-wrap px-2 py-1">
        <div className="flex items-center gap-1 flex-wrap">
          <PurchaseFooterBox label="Total Sale" value={formatINR(saleTotals.grandTotal)} />
          <PurchaseFooterBox label="Paid Amt" value={formatINR(saleTotals.paidAmount)} bg="#22c55e" />
          <PurchaseFooterBox label="Balance Amt" value={formatINR(saleTotals.balanceAmount)} bg="#be5744ff" />
        </div>
      </div>
    ) : page === "customerledge" ? (
      <div className="custom-footer flex justify-between items-center gap-1 flex-wrap px-2 py-1">
        <div className="flex items-center gap-1 flex-wrap">
          <PurchaseFooterBox label="Total Sale" value={formatINR(ledgerTotals.totalSale)} />
          <PurchaseFooterBox label="Paid Amt" value={formatINR(ledgerTotals.totalReceived)} bg="#22c55e" />
          <PurchaseFooterBox label="Balance Amt" value={formatINR(ledgerTotals.balanceAmount)} bg="#be5744ff" />
        </div>
      </div>
    ) : null;

  const parseDDMMYYYY = (dateStr: string): Date | null => {
    const [dd, mm, yyyy] = dateStr.split('-').map(Number);
    if (!dd || !mm || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd);
  };

  const handleDdlSubmit = (values: any[]) => {
    if (!values || values.length === 0) {
      setTableData(originalData);
      setIsDdlFiltered(false);
      return;
    }

    const filtered = originalData.filter((row: any) => {
      const fieldValue = getDdlFilterField(row);
      return values.includes(fieldValue);
    });

    setTableData(filtered);
    setIsDdlFiltered(true);
  };

  const handleDateSubmit = () => {
    if (!fromDate || !toDate) return;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // decide date field based on page
    const getDateField = (row: any) => {
      if (page === "purchase") return row.invoiceDate;
      if (page === "sale") return row.saleOnDate;
      if (page === "shipment") return row.shipmentDate;
      if (page === "voucher") return row.voucherDate;
      if (page === "dailyexpense") return row.expenseDate;
      if (page === "customerledge") return row.lastUpdated;
      return null;
    };

    const filtered = originalData.filter((row: any) => {
      const dateValue = getDateField(row);
      if (!dateValue) return false;

      const rowDate = parseDDMMYYYY(dateValue);
      if (!rowDate) return false;

      return rowDate >= from && rowDate <= to;
    });

    setTableData(filtered);
    setIsDateFiltered(true);
  };

  const handleClearFilter = () => {
    if (isDateFiltered) {
      setFromDate(null);
      setToDate(null);
      setTableData(originalData);
      setIsDateFiltered(false);
    }
  }

  const getDdlPlaceholder = () => {
    if (page === "purchase") return "Select Supplier";
    if (page === "sale") return "Select Customer";
    if (page === "quotation") return "Select Customer";
    if (page === "shipment") return "Select Transporter";
    if (page === "voucher") return "Select Customer";
    if (page === "dailyexpense") return "Select Expense Category";
    if (page === "customerledge") return "Select Customer";
    return "Select";
  };

  //   const exportToExcel = () => {
  //   if (!tableData || tableData.length === 0) return;

  //   const dataForExcel = tableData.map((row) => {
  //     const obj: any = {};
  //     columns.forEach((col) => {
  //       if (!col.hidden) {
  //         obj[col.header] = col.body ? col.body(row) : row[col.field as string];
  //       }
  //     });
  //     return obj;
  //   });

  //   const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  //   XLSX.writeFile(workbook, `Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  // };

  const exportToExcel = () => {
    const exportData = tableData.map(sale => ({
      "Customer": sale.customerName ?? "",
      "Sale Ref No": sale.saleRefNo ?? "",
      "Sale Date": sale.saleOnDate ?? "",
      "Sale Type": sale.paymentTypeName ?? "",
      "Total": sale.grandTotal ?? 0,
      "Paid Amt": (sale.cash ?? 0) + (sale.upi ?? 0),
      "Bal Amt": sale.grandTotal - ((sale.cash ?? 0) + (sale.upi ?? 0)),
      "Run Amt": sale.runningBalance ?? 0,
      "Print": "" // or leave blank
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesSummary");
    XLSX.writeFile(workbook, `SalesSummary_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPdf = () => {
    if (!tableData || tableData.length === 0) return;

    const doc = new jsPDF();
    const tableColumn = columns.filter(c => !c.hidden).map(c => c.header);

    const tableRows = tableData.map(row =>
      columns.filter(c => !c.hidden).map(c =>
        c.exportValue
          ? c.exportValue(row)
          : row[c.field as string] ?? ""
      )
    );

    doc.text("Report", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: columns.reduce((acc, col, idx) => {
        if (col.type === "number" || col.type === "decimal" || col.type === "currency") {
          acc[idx] = { halign: "right" }; // right-align numeric columns
        }
        return acc;
      }, {} as Record<number, any>)
    });

    doc.save(`Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="card p-3 h-[calc(100vh-100px)]">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">

        <div className="flex gap-2 mb-3">
          <Button
            label="Export Excel"
            icon="pi pi-file-excel"
            className="p-button-success p-button-sm custom-xs"
            onClick={exportToExcel}
            size="small"
          />
          <Button
            label="Export PDF"
            icon="pi pi-file-pdf"
            className="p-button-danger p-button-sm custom-xs"
            onClick={exportToPdf}
            size="small"
          />
        </div>

        <div className="flex gap-2">

          {isDelete && selectedRows.length > 0 && (
            <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              onClick={handleDelete}
              size="small"
              className="p-button-sm custom-xs"
            />
          )}
        </div>

        {showDateFilter && (
          <>
            <div className="ml-auto">
              <div className="flex items-end gap-2 mb-3 flex-wrap">

                {showDdlFilter && (
                  <MultiSelect
                    value={ddlFilterValues}
                    options={ddlOptions}
                    optionLabel="label"
                    optionValue="value"
                    placeholder={getDdlPlaceholder()}
                    className="w-20rem"
                    display="chip"
                    filter
                    showClear
                    onChange={(e) => {
                      setDdlFilterValues(e.value);
                      handleDdlSubmit(e.value);
                    }}
                  />
                )}

                <div className="flex flex-col">
                  <Calendar
                    value={fromDate}
                    onChange={(e) => setFromDate(e.value ?? null)}
                    dateFormat="yy-mm-dd"
                    showIcon
                    className="w-40"
                    placeholder="From date"
                  />
                </div>

                <div className="flex flex-col">
                  <Calendar
                    value={toDate}
                    onChange={(e) => setToDate(e.value ?? null)}
                    dateFormat="yy-mm-dd"
                    showIcon
                    className="w-40"
                    minDate={fromDate ?? undefined}
                    placeholder="To date"
                  />
                </div>

                <Button
                  icon={"pi pi-check"}
                  size="small"
                  disabled={!isDateFiltered && (!fromDate || !toDate)}
                  onClick={handleDateSubmit}
                  className="h-[38px]"
                />
                {isDateFiltered && (
                  <Button
                    icon={"pi pi-times"}
                    size="small"
                    disabled={!isDateFiltered && (!fromDate || !toDate)}
                    onClick={handleClearFilter}
                    className="h-[38px]"
                    severity={"danger"}
                  />
                )}
              </div>
            </div>

            <span className="p-input-icon-left relative w-64 ml-2">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setFilters((prev: any) => ({
                      ...prev,
                      global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
                    }));
                  }}
                  placeholder="Search"
                />
              </IconField>
            </span>
          </>
        )}

        {!showDateFilter && (
          <div className="ml-auto">
            <span className="p-input-icon-left relative w-64 ml-2">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setFilters((prev: any) => ({
                      ...prev,
                      global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
                    }));
                  }}
                  placeholder="Search"
                />
              </IconField>
            </span>
          </div>
        )}

      </div>

      <ConfirmDialog />

      <DataTable
        value={tableData}
        dataKey={primaryKey as string}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        selectionMode="checkbox"
        editMode="row"
        frozenWidth="250px"
        size="small"
        scrollable
        style={{ width: "100%" }}
        rowClassName={(rowData, rowIndex: any) =>
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }
        filters={filters}
        globalFilterFields={columns.map((c) => c.field as string)}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate={
          isMobile
            ? "PrevPageLink NextPageLink CurrentPageReport"
            : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        }
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        footer={tableFooter}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} frozen />

        <Column
          header="No."
          body={(_, options) => options.rowIndex + 1}
          style={{ width: "40px", minWidth: "40px" }}
          frozen
        />

        {columns
          .filter((col) => !col.hidden)
          .map((col) => (
            <Column
              key={String(col.field)}
              field={col.field as string}
              header={
                <>
                  {col.header} {col.required && <span className="required-asterisk">*</span>}
                </>
              }
              editor={undefined}
              body={col.body ? (rowData: T) => col.body!(rowData) : undefined}
              style={{
                width: col.width || "auto",
                minWidth: col.width || "120px",
              }}
              frozen={col.frozen}
              sortable={sortableColumns?.includes(col.field)}
            />
          ))}
      </DataTable>
    </div >
  );
}
