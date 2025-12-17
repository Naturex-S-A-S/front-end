import { useQuery } from "@tanstack/react-query";

import { getRoles } from "@/api/role";
import type { Role } from "@/types/pages/role";

const useGetRoles = () => {
    return useQuery<Role[]>({
        queryKey: ['getRoles'],
        queryFn: getRoles
    })


}

export default useGetRoles;
