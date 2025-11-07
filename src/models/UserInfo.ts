export interface UserObject {
  id: string;
  roles: string[];
  profileClaims: object;
  firstname: string;
  lastname: string;
  email: string;
}

export interface DecodedToken {
  sub: string;
  firstname: string;
  lastname: string;
  email: string;
}
