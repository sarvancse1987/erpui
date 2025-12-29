export interface QuotationItemModel {
  quotationItemId: number;
  quotationId: number;
  productId: number;
  productName?: string;
  salePrice: number;
  unitPrice: number;
  quantity: number;
  gstPercent?: number;
  amount: number;
  gstAmount?: number;
  totalAmount?: number;
  supplierId?: number;
}
