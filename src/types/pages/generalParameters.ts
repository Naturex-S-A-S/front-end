interface IBaseCategory {
  name: string;
}

export interface ICategory extends IBaseCategory {
  id: string;
  categoryId: string;
  type?: string;
  dateCreated: string;
}

export type IPutCategory = ICategory;

export type IPostCategory = IBaseCategory;

// Endpoint /warehouses
interface IBaseWarehouse {
  name: string;
  address: string;
  phone: string;
}

export interface IWarehouse extends IBaseWarehouse {
  id: string;
  racks: IRack[];
  active: boolean;
  dateCreated: string;
}

export interface IRack {
  id: string;
  name: string;
  description: string;
  active: boolean;
  dateCreated: string;
  idWarehouse: string;
}

export type IPostWarehouse = IBaseWarehouse;

export type IPutWarehouse = Pick<IWarehouse, "address">;

// Endpoint /racks
export type IPostRack = {
  name: string;
  description: string;
  idWarehouse: string;
};

export type IPutRack = Partial<Pick<IRack, "name" | "description" | "active">>;
