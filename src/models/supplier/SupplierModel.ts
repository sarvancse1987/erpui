export interface SupplierModel {
    supplierId: number;
    supplierName: string;
    contactPerson: string;
    phone: string;
    email?: string | null | undefined;
    gstNumber?: string | null | undefined;
    address?: string | null | undefined;
    city?: string | null | undefined;
    postalCode?: string | null | undefined;
    stateId?: number | null | undefined;
    stateName?: string | null | undefined;
    countryId?: number | null | undefined;
    countryName?: string | null | undefined;
    districtId?: number| null | undefined;
    districtName?: string | null | undefined;
    isActive: boolean;
    createdAt: string;
}
