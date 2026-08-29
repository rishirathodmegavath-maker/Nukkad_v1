import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { toast } from '@/store/toast.store'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function GoogleSignInButton({ onSuccess }: { onSuccess: (isNewUser: boolean) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return

    let cancelled = false
    function render() {
      if (cancelled || !window.google || !containerRef.current) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          try {
            const { isNewUser } = await loginWithGoogle(response.credential)
            onSuccess(isNewUser)
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Google sign-in failed')
          }
        },
      })
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      })
    }

    if (window.google) {
      render()
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval)
          render()
        }
      }, 100)
      return () => {
        cancelled = true
        clearInterval(interval)
      }
    }
  }, [loginWithGoogle, onSuccess])

  if (!CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-fg-muted">or</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
      <div ref={containerRef} />
    </div>
  )
}
