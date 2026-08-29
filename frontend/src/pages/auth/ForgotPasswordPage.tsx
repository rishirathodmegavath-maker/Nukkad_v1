import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import * as authService from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await authService.requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We’ll send you a link to get back into your account."
      footer={
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <CheckCircle2 className="size-10 text-success-500" />
          <p className="text-sm text-fg">
            If an account exists for <span className="font-medium">{email}</span>, we’ve sent a reset link.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="size-4" />}
            placeholder="you@example.com"
            error={error || undefined}
          />
          <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
