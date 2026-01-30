import { useQuery } from "@tanstack/react-query";

import { getPackagingById } from "@/api/packaging";

export interface IPackaging {
    id: number;
    name: string;
    minimumStandard: number;
    chargeTotal: number;
    quantityTotal: number;
    chargeU: number;
    active: boolean;
    dateCreated: string;
    color: string;
    idType: number;
    typeName: string;
    categories: [];
    providers: [];
}

const useGetPackagingById = (id: string) => {
    const { data, isLoading, isFetching, isRefetching } = useQuery<IPackaging | null>({
        queryKey: ['getPackagingById', id],
        queryFn: () => getPackagingById(id)
    })

    return {
        packaging: data,
        isLoading,
        isFetching,
        isRefetching
    }
}

export default useGetPackagingById;
