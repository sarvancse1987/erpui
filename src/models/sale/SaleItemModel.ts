export interface SaleItemModel {
  saleItemId: number;

  // Foreign Keys
  saleId: number;
  productId: number;

  // Properties
  productName?: string;

  salePrice: number;
  unitPrice: number;
  quantity: number;
  gstPercent: number;
  amount: number;
  gstAmount: number;
  totalAmount: number;
}
