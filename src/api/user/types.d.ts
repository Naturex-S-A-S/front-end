export interface IAuthenticationData {
  dni: string;
  dniType: string;
  password: string;
}

export interface IAuthenticationResponse {
  token: string;
  refreshToken: string;
  userId: string;
  userName: string;
  userLastName: string;
  email: string;
  role: { id: number; name: string };
  modules: any[];
}
