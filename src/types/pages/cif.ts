export interface ICifType {
  id: number;
  name: string;
  costBasis: string;
  active: boolean;
  dateCreated: string;
}

export interface IPostCifType {
  name: string;
  costBasis: "fixed" | "variable";
  active: boolean;
}

export interface IPeriod {
  id: number;
  name: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  status: string;
  totalKgProduced: number | null;
  cifRatePerKg: number | null;
  dateClosed: string | null;
  notes?: string;
  nameUser: string;
  dateCreated: string;
  items: IItemPeriod[];
}
export interface IItemPeriod {
  id: number;
  amount: number;
  description: string;
  idCifType: number;
  cifTypeName: string;
  cifTypeCostBasis: string;
  idPeriod: number;
  nameUser: string;
  dateCreated: string;
}

export interface IPostPeriod {
  name: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  notes?: string;
}
