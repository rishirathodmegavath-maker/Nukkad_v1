import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/store/auth.store'
import { AppRoutes } from '@/routes/AppRoutes'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function App() {
  const init = useAuthStore((s) => s.init)
  const status = useAuthStore((s) => s.status)

  useEffect(() => {
    init()
  }, [init])

  if (status !== 'ready') return null

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
