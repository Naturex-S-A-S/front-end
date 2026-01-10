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
    allergen: boolean;
    idType: number;
    typeName: string;
    categories: any[];
    providers: any[];
}

const useGetFeedstockById = (id: string) => {
    const { data, ...rest } = useQuery<IFeedstock | null>({
        queryKey: ['getFeedstock', id],
        queryFn: () => getFeedstockById(id)
    })

    return {
        ...rest,
        feedstock: data,
    }
}

export default useGetFeedstockById;
