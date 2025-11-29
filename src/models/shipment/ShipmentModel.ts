export interface ShipmentModel {
    shipmentDate: string | Date | null;
    shipmentTypeId: number | null;

    distance?: number | null | undefined;
    address: string;
    vehicleNo: string;
    driver: string;

    remarks: string;
    saledId: number;
}