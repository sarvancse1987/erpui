// models/User.ts
export interface MyProfileModel {
    id?: number;
    userImage?: string | null;
    salutation: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
}
