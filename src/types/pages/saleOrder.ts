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
    kardexProducts: any[];
}
