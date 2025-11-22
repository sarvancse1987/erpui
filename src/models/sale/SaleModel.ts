import { SaleItemModel } from "./SaleItemModel";

export interface SaleModel {
    saleId: number;
    salesNumber: string;
    saleRefNo: string;
    // Foreign Keys
    customerId: number;
    customerName?: string;
    saleTypeId: number;
    saleType?: string;
    paymentTypeId: number;
    paymentTypeName?: string;
    saleStatusId: number;
    isGst: boolean;

    // Properties
    saleDate: Date;

    totalAmount: number;
    totalGST?: number;
    grandTotal: number;
    paidAmount: number;
    balanceAmount?: number;
    runningBalance?: number;
    freightAmount?: number;
    roundOff?: number;

    noOfDays?: number;
    dueDate?: Date;
    remarks?: string;
    franchiseId?: number;
    billingFranchiseId?: number;

    saleItems: SaleItemModel[];
}
