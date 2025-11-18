export interface CustomerModel {
    customerId: number;

    customerName: string;

    phone?: string | null;

    email?: string | null;

    gstNumber?: string | null;

    address?: string | null;

    city?: string | null;

    countryId?: number | null;

    stateId?: number | null;

    stateName?: string | null;

    districtId?: number | null;

    districtName?: string | null;

    postalCode?: string | null;

    currentEligibility?: number | null;
}
