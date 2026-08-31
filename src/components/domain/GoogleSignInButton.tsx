import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/store/toast.store'
import { googleRedirectUri } from '@/lib/google-auth'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const OAUTH_STATE_KEY = 'nukkad.google_oauth_state'

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.48a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.75l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  )
}

/**
 * Uses Google's own OAuth 2.0 authorization-code redirect flow (`google.accounts.oauth2.initCodeClient`
 * with `ux_mode: 'redirect'`) — a real top-level browser navigation to Google and back, with no
 * popup, iframe, or postMessage handoff involved. That handoff was the actual point of failure on
 * mobile: Google's credential-callback mechanism depends on delivering a message back into this
 * page's JS, which is subject to a wide range of undocumented mobile browser/FedCM restrictions we
 * have no visibility into. A full-page redirect is the same mechanism OAuth has used since 2007 and
 * behaves identically across every browser.
 */
export function GoogleSignInButton() {
  const [isRedirecting, setIsRedirecting] = useState(false)

  function handleClick() {
    if (!CLIENT_ID || !window.google) {
      toast.error("Google sign-in couldn't be completed. Please try again.")
      return
    }
    setIsRedirecting(true)
    // Round-tripped back to us via the redirect's `state` query param and checked in
    // GoogleCallbackPage — CSRF protection for the OAuth exchange.
    const state = crypto.randomUUID()
    sessionStorage.setItem(OAUTH_STATE_KEY, state)
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      ux_mode: 'redirect',
      redirect_uri: googleRedirectUri(),
      state,
    })
    client.requestCode()
  }

  if (!CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-fg-muted">or</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        isLoading={isRedirecting}
        leftIcon={isRedirecting ? undefined : <GoogleLogo />}
        onClick={handleClick}
      >
        Continue with Google
      </Button>
    </div>
  )
}
