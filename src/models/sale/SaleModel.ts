import { SaleItemModel } from "./SaleItemModel";

export interface SaleModel {
    saleId: number;
    saleRefNo: string;
    // Foreign Keys
    customerId: number;
    customerName?: string;
    saleTypeId: number;
    saleTypeName?: string;
    paymentTypeId?: number;
    paymentTypeName?: string;
    saleStatusId?: number;
    saleStatusName?: number;
    isGst: boolean;

    // Properties
    saleDate: string | Date | null;
    saleOnDate?: string;
    totalAmount: number;
    paidAmount: number;
    brokerageAmount?: number;
    balanceAmount?: number;
    totalGST?: number;
    freightAmount?: number;
    roundOff?: number;
    grandTotal: number;
    runningBalance?: number;

    noOfDays?: number;
    dueDate?: Date;
    remarks?: string;
    franchiseId?: number;
    billingFranchiseId?: number;

    saleItems: SaleItemModel[];
}
