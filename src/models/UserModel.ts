// models/User.ts
export interface UserModel {
    id?: number;
    username: string;
    passwordHash: string;
    userImage?: string;
    salutation: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    roleId: number;
    userTypeId: number;
    companyId: number;
    locationId: number;
    isActive: boolean;
}
