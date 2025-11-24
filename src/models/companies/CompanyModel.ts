export interface CompanyModel {
    id: number;
    name: string;
    address?: string; 
    logo?: string;
    path?: string;
    city?: string;
    stateId?: number| null; 
    countryId?: number| null;
    districtId?: number | null;
    zipcode?: string; 
    phone?: string; 
    email?: string; 
    website?: string; 
    gstNumber?: string; 
    bankName?: string;
    branchName?: string; 
    accountType?: string;
    accountName?: string; 
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string; 
    signature?: string; 
    companyId?: number; 
    locationId?: number; 
    isActive: boolean; 
}
