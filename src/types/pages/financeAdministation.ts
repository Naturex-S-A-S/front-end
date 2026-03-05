export interface IPostProvider {
    name: string;
    address: string;
    phone: string;
}

export interface IProvider {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    active: boolean;
    dateCreated: string;
}
