import { VoucherModel } from "./VoucherModel";

export interface VoucherCustomerModel {
    customerId: number;
    customerName: string | undefined;
    vouchers: VoucherModel[];
}