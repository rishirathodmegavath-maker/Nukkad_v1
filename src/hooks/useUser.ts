import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/services/users.service'

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id!),
    enabled: !!id,
    staleTime: 60_000,
  })
}
