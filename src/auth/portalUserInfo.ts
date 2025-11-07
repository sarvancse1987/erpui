import jwt_decode from "jwt-decode";
import { DecodedToken, UserObject } from "../models/UserInfo";

let userObject: UserObject = {
    id: '',
    roles: [],
    profileClaims: {},
    firstname: '',
    lastname: '',
    email: ''
  };

let getUserAuthToken: () => Promise<string> = () => {
    throw new Error('Auth token not set up')
}

export const setUserInfo = async (user: UserObject): Promise<void> => {
    userObject.roles = [...user.roles];
    userObject.profileClaims = { ...user.profileClaims };
  
    try {
      const access_token = await getUserAuthToken();
      const { sub, firstname, lastname, email } = jwt_decode<DecodedToken>(access_token);
  
      userObject.id = sub;
      userObject.firstname = firstname;
      userObject.lastname = lastname;
      userObject.email = email;
    } catch (error) {
      console.error('Failed to decode token or retrieve user info:', error);
    }
  };
  

export const setAuthTokenGetter = (getToken: () => Promise<string>) => {
    getUserAuthToken = getToken;
}

export const isUserLoggedIn = (): boolean => userObject.id != null && userObject.id != '' && userObject.id != undefined
export const getAuthToken = (): Promise<string> => getUserAuthToken()
export const getUserId = (): string => userObject.id
export const getUserFullName = (): string => `${userObject.firstname} ${userObject.lastname}`
export const getUserEmail = (): string => userObject.email
export const getUserRoles = () => {
    return userObject.roles
}
export const getHasUserRole = (role: string) => {
    return userObject.roles.some((roles: any) => roles.toLowerCase().trim() == role.toLowerCase().trim());
}