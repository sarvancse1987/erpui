import { SaleItemModel } from "./SaleItemModel";

export interface SaleModel {
    saleId: number;

    // Foreign Keys
    customerId: number;
    saleTypeId: number;
    paymentTypeId: number;
    saleStatusId: number;

    // Properties
    saleDate: Date;

    totalAmount: number;
    totalGST?: number;
    grandTotal: number;
    paidAmount: number;
    balanceAmount?: number;
    freightAmount?: number;
    roundOff?: number;

    noOfDays?: number;
    dueDate?: Date;
    remarks?: string;
    franchiseId?: number;
    billingFranchiseId?: number;

    saleItems: SaleItemModel[];
}
