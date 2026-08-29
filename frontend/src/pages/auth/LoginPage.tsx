import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GoogleSignInButton } from '@/components/domain/GoogleSignInButton'
import { useAuthStore } from '@/store/auth.store'
import { resendVerificationEmail } from '@/services/auth.service'
import { ApiError } from '@/lib/api-client'
import { toast } from '@/store/toast.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [googleNotice, setGoogleNotice] = useState<{ message: string; action?: 'signup' } | null>(null)
  const [showResend, setShowResend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  function goHome() {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    navigate(from, { replace: true })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setShowResend(false)
    setGoogleNotice(null)
    setIsLoading(true)
    try {
      await login({ email, password })
      toast.success('Welcome back!')
      goHome()
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before signing in.')
        setShowResend(true)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    setIsResending(true)
    try {
      await resendVerificationEmail(email)
      toast.success('Verification email sent again.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  function handleGoogleError(err: Error) {
    if (err instanceof ApiError && err.errorCode === 'GOOGLE_NO_ACCOUNT') {
      setGoogleNotice({ message: "Your Google account isn't connected to a Nukkad account yet.", action: 'signup' })
    } else if (err instanceof ApiError && err.errorCode === 'GOOGLE_ACCOUNT_NOT_LINKED') {
      setGoogleNotice({
        message:
          "This Nukkad account isn't connected to Google yet. Sign in with your email and password, then connect Google from Security settings.",
      })
    } else {
      toast.error(err.message || 'Google sign-in failed')
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep building on Nukkad."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="size-4" />}
          placeholder="you@example.com"
        />
        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="size-4" />}
            placeholder="Your password"
            error={error || undefined}
          />
          <Link to="/forgot-password" className="self-end text-xs font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        {showResend && (
          <Button type="button" variant="secondary" size="sm" isLoading={isResending} onClick={handleResend}>
            Resend verification email
          </Button>
        )}
        <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
          Log in
        </Button>
        {googleNotice && (
          <div className="rounded-lg border border-border/80 bg-surface-sunken px-3 py-2.5 text-xs text-fg-secondary">
            <p>{googleNotice.message}</p>
            {googleNotice.action === 'signup' && (
              <Link to="/signup" className="inline-block mt-1.5">
                <Button size="sm">Create Nukkad account</Button>
              </Link>
            )}
          </div>
        )}
        <GoogleSignInButton onSuccess={goHome} onError={handleGoogleError} />
      </form>
    </AuthLayout>
  )
}
