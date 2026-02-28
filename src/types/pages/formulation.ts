export interface IPostFormulation {
    name: string
    comment: string
    active: boolean
    details: {
        idMaterial: number
        quantity: number
    }[]
    products: string[]
}

export interface IPostFormulationVersion {
    idFormulation: number;
    comment: null | string;
    active: boolean;
    details: IDetail[] | null;
}

export interface IFormulationAll {
    id: number;
    name: string;
    dateCreated: Date;
    totalVersions: number;
    totalProducts: number;
    activeVersion: number;
    versions: any[];
    products: any[];
}

export interface IFormulation {
    id: number;
    name: string;
    dateCreated: Date;
    idUser: string;
    productFormulations: IProduct[];
    versions: IVersion[];
}

export interface IProduct {
    id: number;
    dateAssigned: Date;
    idUser: string;
    idFormulation: null;
    idFinalProduct: string;
    finalProduct: FinalProduct;
}

interface FinalProduct {
    id: string;
    name: string;
    measurement: number;
    unit: string;
    minimumStandard: null;
    active: null;
    dateCreated: null;
    formulations: null;
    productHistory: null;
    recentKardex: null;
}


interface IDetail {
    id: number;
    material: Material;
    formulationVersion: IVersion;
    quantity: number;
    materialName: null;
}

export interface IVersion {
    id: number;
    sequentialNumber: number;
    comment: null | string;
    dateCreated: Date | null;
    idUser: null | string;
    idFormulation: number | null;
    active: boolean;
    details: IDetail[] | null;
    productVersions: IProductVersion[] | null;
}

interface Material {
    id: number;
    name: null;
    minimumStandard: null;
    charge: null;
    quantityG: null;
    active: null;
    dateCreated: null;
    type: null;
    category: null;
}

interface IProductVersion {
    id: number;
    active: boolean;
    dateAssigned: Date;
    idUser: string;
    idFormulationVersion: number;
    idFinalProduct: string;
    finalProduct: IFinalProduct;
}

interface IFinalProduct {
    id: string;
    name: string;
    measurement: null;
    unit: null;
    minimumStandard: null;
    active: null;
    dateCreated: null;
    formulations: null;
    productHistory: null;
    recentKardex: null;
}
