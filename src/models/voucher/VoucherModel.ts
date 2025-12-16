export enum VoucherType {
    Credit = 1,
    Debit = 2,
    Sales = 3,
    Purchase = 4,
    Receipt = 5,
    Payment = 6
}


export interface VoucherModel {
    voucherId: number;

    voucherNo: string;

    voucherDate: Date | string;

    voucherTime: string;

    voucherType: VoucherType;

    customerId: number;

    customerName?: string;

    phone?: string;

    address?: string;

    totalDebit: number;

    totalCredit: number;

    remarks?: string;

    closingBalance?: number;
}