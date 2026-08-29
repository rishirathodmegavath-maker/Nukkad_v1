import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAppearanceSettings } from '@/services/appearance.service'
import { useThemeStore } from '@/store/theme.store'

/** Reconciles the local (pre-paint, localStorage-cached) theme with the authenticated user's
 * server-persisted appearance settings — picks up changes made on another device. */
export function useAppearanceSync() {
  const hydrateFromServer = useThemeStore((s) => s.hydrateFromServer)
  const { data } = useQuery({
    queryKey: ['appearance-settings'],
    queryFn: getAppearanceSettings,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (data) hydrateFromServer(data)
  }, [data, hydrateFromServer])
}
