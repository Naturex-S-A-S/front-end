export interface IAuthenticationData {
    dni: string;
    dniType: string;
    password: string;
}

export interface IAuthenticationResponse {
    user: {
        id: string;
        name: string;
        email: string;
    };
    token: string;
}
