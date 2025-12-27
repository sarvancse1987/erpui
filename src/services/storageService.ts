import { decryptData, encryptData } from "./crypto-js";

// storage.ts
export interface UserData {
    authToken: string;
    companyId: number;
    locationId: number;
    userId: number;
    userProfileName: string;
    firstName?: string;
    lastName?: string;
    userImage?: string;
    companyName?: string;
    location?: string;
    companyLogo?: string;
}

export const storage = {
    setUser(userData: UserData) {
        const encrypted = encryptData(userData);
        localStorage.setItem("user", encrypted);
    },

    getUser(): UserData | null {
        const encrypted = localStorage.getItem("user");
        if (!encrypted) return null;

        try {
            return decryptData(encrypted);
        } catch (err) {
            console.error("Decryption error:", err);
            return null;
        }
    },

    getToken(): string {
        return this.getUser()?.authToken || "";
    },

    clear() {
        localStorage.removeItem("user");
    },

    updateUserProfileName(firstName: string, lastName?: string) {
        const user = this.getUser();
        if (!user) return;

        let fullName = firstName;
        if (lastName && lastName.trim() !== "") {
            fullName = `${firstName} ${lastName}`;
        }

        user.userProfileName = fullName;
        user.firstName = firstName;
        user.lastName = lastName;

        this.setUser(user);
    },
    updateUserImage(userImage: string) {
        const user = this.getUser();
        if (!user) return;
        user.userImage = userImage;
        this.setUser(user);
    },
    updateUserCompanyLogo(logo: string) {
        const user = this.getUser();
        if (!user) return;

        if (logo && logo.trim() !== "") {
            user.companyLogo = logo;
            this.setUser(user);
        }
    },
    setUserModule(data: any[]) {
        const encrypted = encryptData(data);
        localStorage.setItem("userModule", encrypted);
    },
    setUserModuleAction(data: any[]) {
        const encrypted = encryptData(data);
        localStorage.setItem("userModuleAction", encrypted);
    },
    getUserModules() {
        const data = localStorage.getItem("userModule");
        return data ? decryptData(data) : [];
    },
    getUserActions() {
        const data = localStorage.getItem("userModuleAction");
        return data ? decryptData(data) : [];
    },
    hasModule(moduleName: string): boolean {
        var isExists = this.getUserModules().some((m: any) => m.moduleName === moduleName);
        return isExists;
    },
    hasAction(moduleName: string, action: string): boolean {
        var isExists = this.getUserActions().some(
            (a: any) => a.moduleName === moduleName && a.action === action
        );
        return isExists;
    }
};
