export interface SaleItemModel {
  saleItemId: number;

  // Foreign Keys
  saleId: number;
  productId: number;
  productName?: string;

  salePrice: number;
  unitPrice: number;
  quantity: number;
  gstPercent?: number;
  amount: number;
  gstAmount?: number;
  totalAmount?: number;
}
