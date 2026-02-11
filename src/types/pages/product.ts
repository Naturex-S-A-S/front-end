
export interface IProduct {
    id: string
    name: string
    measurement: number
    unit: string
    minimumStandard: number
    active: boolean
    dateCreated: string
    formulations: any
    productHistory: IProductHistory[]
    recentKardex: IRecentKardex[]
}

export interface ICreateProduct {
    id: string
    name: string
    measurement: number
    unit: string
    minimumStandard: number
}

export interface IUpdateProduct {
    name: string
    measurement: number
    unit: string
    minimumStandard: number
}

export interface IProductHistory {
    id: number
    quantityInProcess: number
    quantityCompleted: number
    charge: number
    dateCreated: string
    idFinalProduct: string
}

interface IRecentKardex {
    id: number
    type: string
    classification: string
    observation: string
    batch: string
    rack: string
    location: string
    quantity: number
    dateCreated: string
    expirationDate1: string
    expirationDate2: string
    idUser: string
    idOrder: number
    idFinalProduct: string
}
