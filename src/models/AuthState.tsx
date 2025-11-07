export class AuthState {
  email: string = "";
  password: string = "";
  token: string | null = null;
  user: any = null;
  loading: boolean = false;
  error: string | null = null;
}
