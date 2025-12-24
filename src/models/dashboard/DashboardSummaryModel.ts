export interface DashboardSummaryModel {
    activeProductsCount: number;
    totalSalesAmount: number;
    last30DaysSalesAmount: number;
    totalStockItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalStockValue: number;
    customerBalanceAmount: number;
}