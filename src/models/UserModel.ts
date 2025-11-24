// models/User.ts
export interface UserModel {
    id?: number;
    username: string;
    passwordHash?: string;
    userImage?: string;
    salutation: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    roleId: number;
    roleName?: string;
    userTypeId: number;
    userTypeName?: string;
    companyId: number | null;
    companyName?: string;
    locationId: number | null;
    locationName?: string;
    isActive: boolean;
}
