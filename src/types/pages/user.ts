export interface IUser {
    id?: string;
    dni: string;
    dniType: string;
    name: string;
    lastName: string;
    email: string;
    address: string;
    phone: string;
    password: string;
    roleId: number;
    roleName?: string;
}
