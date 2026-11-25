import { useQuery } from "@tanstack/react-query";

import { getFeedstockById } from "@/api/feedstock";

export interface IFeedstock {
  id: number;
  name: string;
  minimumStandard: number;
  charge: number;
  quantityG: number;
  quantityK: number;
  quantityT: number;
  chargeG: number;
  chargeKg: number;
  chargeT: number;
  active: boolean;
  dateCreated: string;
  defaultProviderId: number;
  defaultProviderName: string;
  allergen: boolean;
  idType: number;
  typeName: string;
  categories: any[];
  providers: any[];

  // Stock disponible (lotes no vencidos) y vencido. quantityG/charge son el stock físico.
  availableQuantityG: number;
  availableQuantityK: number;
  availableQuantityT: number;
  availableChargeG: number | null;
  availableChargeKg: number | null;
  availableChargeT: number | null;
  availableCharge: number;
  expiredQuantityG: number;
  expiredQuantityK: number;
  expiredQuantityT: number;
  expiredCharge: number;
}

const useGetFeedstockById = (id: string) => {
  const { data, ...rest } = useQuery<IFeedstock | null>({
    queryKey: ["getFeedstock", id],
    queryFn: () => getFeedstockById(id)
  });

  return {
    ...rest,
    feedstock: data
  };
};

export default useGetFeedstockById;
