export interface ShipmentListModel {
    shipmentId: number;
    saleId: number;
    saleRefNo: string;
    shipmentDate: string;
    shipmentTypeName: string;
    distance: number;
    vehicleNo: string;
    driver: string;
    address: string;
    freightAmount: number;
    isActive: boolean;
}
