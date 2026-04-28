export interface IOrderDetail {
    id: number
    idMaterial: string
    nameMaterial: string
    typeMaterial: string
    quantity: number
    quantityTotal: number
    charge: number
    chargeTotal: number
}

export interface IOrderItem {
    idFinalProduct: string
    quantityU: number
    quantityKg: number
    finalProduct: {
        id: string
        name: string
        measurement: number
        unit: string
    }
}

export interface IOrder {
    id: number
    classification: string
    batch: string
    status: string
    quantityExpected: number
    quantityProduced: number
    charge: number
    dateCreated: string
    dateClosed: string | null
    dateExpiration: string
    idUser: string
    idFormulation: number
    idVersion: number
    formulationName: string
    userFullName: string
    items: IOrderItem[]
    details: IOrderDetail[]
}

export interface IOrderList {
    id: number
    orderId: number
    batch: string
    dateCreated: string
    quantityExpected: number
    status: string
    productNames: string[]
}

export interface IOrderSupplyList {
    id: number
    orderId: number
    batch: string
    dateCreated: string
    quantityExpected: number
    productNames: string[]
}

export interface IOrderSupplyMaterial {
    id: string
    name: string
    quantityAvailable: number
    quantityMissing: number
    quantityTotalOrder: number
    totalCost: number
}

export interface IOrderSupplyProduct {
    id: string
    fullName: string
    units: number
}

export interface IOrderSupply {
    id: number
    batch: string
    totalQuantityInKg: number
    totalQuantityInUnits: number
    totalChargeOrder: number
    dateCreated: string
    userName: string
    materials: IOrderSupplyMaterial[]
    products: IOrderSupplyProduct[]
}

export interface IOrderCreate {
    quantityExpected: number
    batch: string
    date_expiration: string
    products: {
        id: string
        quantity: number
        base?: boolean
    }[]
}
