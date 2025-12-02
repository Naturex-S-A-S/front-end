export type ProfileData = {
    dniType: string;
    dni: string;
    name: string;
    lastName: string;
    email: string;
    address: string;
    phone: string;
    role: string;
    modules: Module[];
}

export type Module = {
    moduleId: number;
    moduleName: string;
    submoduleName: string;
    groupName: null;
    modulePath: string;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
}

export type UpdateProfilePayload = Pick<ProfileData, 'name' | 'lastName' | 'email' | 'phone' | 'address'> & {
    dni?: string | null;
    dniType?: string | null;
    role?: string | null;
    password?: string | null;
};
