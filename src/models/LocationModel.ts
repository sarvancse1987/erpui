export interface LocationModel {
    id?: number;
    name: string;
    address?: string;
    phone: string;
    email: string;
    pincode?: string;
    countryId?: number | null;
    stateId?: number | null;
    districtId?: number | null;
    isActive: boolean;
    companyId: number;
    companyName?: string;
    stateName?: string;
    countryName?: string;
    districtName?: string;
}
