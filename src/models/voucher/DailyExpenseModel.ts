export interface DailyExpenseModel {
  dailyExpenseId: number;
  expenseDate: Date | null;
  expenseTime?: string | "";
  expenseCategoryId: number;
  expenseCategoryName?: string | "";
  employeeId?: number | null;
  employeeName?: string | "";
  amount: number;
  remarks?: string;
  isApproved: boolean;
  createdByName?: string;
  createdByUsername?: string;
}
