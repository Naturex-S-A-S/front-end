export interface IPostPacking {
  productId: string;
  packaging: Array<{
    id: number;
    quantity: number;
  }>;
}

export interface IPacking {
  id: string;
  name: string;
  measurement: number;
  unit: string;
  packagingTotal: number;
  date: string;
}

export interface IPutPacking {
  productId: string;
  packaging: Array<{
    id: number;
    quantity: number;
  }>;
}
