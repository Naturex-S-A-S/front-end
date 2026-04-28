export interface ISaleOrderFinalProduct {
    id: string;
    name: string;
    measurement: number;
    unit: string;
}

export interface ISaleOrderDetail {
    id: string;
    quantity: number;
    charge: number;
    idSalesOrder: string;
    idFinalProduct: string;
    finalProduct: ISaleOrderFinalProduct;
}
export interface ISaleOrderKardex {
    id: number;
    type: string;
    classification: string;
    observation: string;
    batch: string;
    rack: string | null;
    location: string | null;
    quantity: number;
    dateCreated: string;
    expirationDate1: string | null;
    expirationDate2: string | null;
    idUser: string;
    idOrder: number | null;
    idSalesOrder: number | null;
    idFinalProduct: number | null;
    finalProductName: string;
}

export interface ISaleOrder {
    id: string;
    fileName: string;
    type: string;
    quantity: number;
    charge: number;
    fileDate: string;
    dateCreated: string;
    idUser: string;
    userFullName: string;
    details: ISaleOrderDetail[];
    kardexProducts: ISaleOrderKardex[];
}
