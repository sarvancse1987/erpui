export interface DashboardSaleSummaryModel {
    yearMonth: string;
    monthName: string;
    totalSalesAmount: number | null;
    customerBalanceAmount: number | null;
    profitAmount: number | null;
}