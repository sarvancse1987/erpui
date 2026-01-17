export interface WidgetModel {
  id: string;
  title: string;
  type: 
    | "kpi"
    | "last12months"
    | "paymentSplit"
    | "mostSold"
    | "topCustomers";
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}
