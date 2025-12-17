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
    role: {
        id: number;
        name: string;
    };
    password?: string | null;
};

export type UpdatePasswordPayload = {
    oldPassword: string;
    newPassword1: string;
    newPassword2: string;
}
