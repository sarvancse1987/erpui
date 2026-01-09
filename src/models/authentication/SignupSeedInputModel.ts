export interface SignupSeedInputModel {
    companyName: string;
    companyAddress: string;

    locationName: string;
    locationAddress: string;
    companyEmail: string;
    companyPhone: string;

    adminUsername: string;
    adminPassword: string;
    adminEmail: string;
    adminFirstName: string;

    createdBy?: string;
}