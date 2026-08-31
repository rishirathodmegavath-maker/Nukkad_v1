import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GoogleSignInButton } from '@/components/domain/GoogleSignInButton'
import { useAuthStore } from '@/store/auth.store'
import { toast } from '@/store/toast.store'

export default function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await signup({ name, email, password })
      toast.success('Account created — let’s set up your profile.')
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join builders discovering ideas, teams and opportunities."
      footer={
        <>
          Already on Nukkad?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="size-4" />}
          placeholder="Aarav Mehta"
        />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="size-4" />}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="size-4" />}
          placeholder="At least 8 characters"
          error={error || undefined}
        />
        <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
          Create account
        </Button>
        <p className="text-xs text-fg-muted text-center">
          By continuing you agree to Nukkad’s Terms and Privacy Policy.
        </p>
        <GoogleSignInButton />
      </form>
    </AuthLayout>
  )
}
