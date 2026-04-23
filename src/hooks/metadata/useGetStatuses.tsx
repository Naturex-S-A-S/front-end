import { useQuery } from '@tanstack/react-query'

import { getOrderStatuses } from '@/api/metadata'

interface IOrderStatus {
  key: number
  status: string
}

const useGetStatuses = () => {
  const { data, isLoading } = useQuery<IOrderStatus[]>({
    queryKey: ['orderStatuses'],
    queryFn: getOrderStatuses
  })

  return { statuses: data ? data.map(s => ({ value: s.key, label: s.status })) : [], isLoading }
}

export default useGetStatuses
