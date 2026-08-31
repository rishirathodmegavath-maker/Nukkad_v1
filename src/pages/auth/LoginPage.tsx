import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GoogleSignInButton } from '@/components/domain/GoogleSignInButton'
import { useAuthStore } from '@/store/auth.store'
import { toast } from '@/store/toast.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function goHome() {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    navigate(from, { replace: true })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login({ email, password })
      toast.success('Welcome back!')
      goHome()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
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
        <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
          Log in
        </Button>
        <GoogleSignInButton />
      </form>
    </AuthLayout>
  )
}
