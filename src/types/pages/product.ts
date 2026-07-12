export interface IProduct {
  id: string;
  name: string;
  measurement: number;
  unit: string;
  minimumStandard: number;
  categories: ICategory[];
  active: boolean;
  dateCreated: string;
  formulations: any;
  productHistory: IProductHistory[];
  recentKardex: IRecentKardex[];
  packagings: IProductPackaging[];
}

export interface ICategory {
  id: string;
  name: string;
  dateCreated: string | null;
}

export interface IPackagingMaterial {
  id: number;
  name: string;
  minimumStandard: number | null;
  active: boolean | null;
  quantity: number | null;
  charge: number | null;
  color: string | null;
  dateCreated: string | null;
  category: ICategory[];
  linkedProducts: string | null;
  chargeU: number | null;
}

export interface IProductPackaging {
  id: number;
  quantity: number;
  dateCreated: string;
  dateUpdated: string | null;
  packaging: IPackagingMaterial;
}

export interface ICreateProduct {
  id: string;
  name: string;
  categories: string[];
  measurement: number;
  unit: string;
  minimumStandard: number;
}

export interface IUpdateProduct {
  name: string;
  measurement: number;
  categories: string[];
  unit: string;
  minimumStandard: number;
}

export interface IProductHistory {
  id: number;
  quantityInProcess: number;
  quantityCompleted: number;
  charge: number;
  dateCreated: string;
  idFinalProduct: string;
}

interface IRecentKardex {
  id: number;
  type: string;
  classification: string;
  observation: string;
  batch: string;
  rack: string;
  location: string;
  quantity: number;
  dateCreated: string;
  expirationDate1: string;
  expirationDate2: string;
  idUser: string;
  idOrder: number;
  idFinalProduct: string;
}
