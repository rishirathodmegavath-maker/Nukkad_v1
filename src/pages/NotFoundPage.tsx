import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Compass className="size-6" />
      </span>
      <h1 className="text-2xl font-bold text-fg">Nothing here</h1>
      <p className="text-sm text-fg-muted max-w-sm">The page you’re looking for doesn’t exist or may have moved.</p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
