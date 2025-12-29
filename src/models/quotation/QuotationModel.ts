import { ShipmentModel } from "../shipment/ShipmentModel";
import { QuotationItemModel } from "./QuotationItemModel";

export interface QuotationModel {
    quotationId: number;
    quotationRefNo: string;
    customerId?: number | null;
    customerName?: string | null;
    quotationDate: Date;          // or string if coming as ISO from API
    validTill?: Date | null;
    totalAmount: number;
    totalGST: number;
    freightAmount?: number;
    roundOff?: number;
    grandTotal: number;
    isGst: boolean;
    status: number;               // enum value from backend
    remarks?: string | null;

    quotationItems: QuotationItemModel[];

    print?: string;
}