

export interface VoucherFormModel {
    voucherId: number;
    voucherNo?: string;
    voucherDate: Date | null;
    voucherType: number | null;
    customerId: number | null;
    totalDebit: number;
    totalCredit: number;
    remarks: string;
}