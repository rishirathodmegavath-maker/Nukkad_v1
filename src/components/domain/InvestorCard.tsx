import { Link } from 'react-router-dom'
import type { InvestorProfile } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

export function InvestorCard({ investor }: { investor: InvestorProfile }) {
  const name = investor.user?.name ?? 'Investor'
  return (
    <Card interactive className="flex flex-col gap-3 rounded-xl border border-border/80 shadow-xs hover:border-border-strong transition-all min-w-0 overflow-hidden bg-surface">
      <Link to={`/investors/${investor.id}`} className="flex items-start gap-3">
        <Avatar src={investor.user?.avatarUrl} name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-fg truncate text-base">{name}</p>
          <p className="text-xs sm:text-sm text-fg-muted truncate mt-0.5">{investor.firmName || investor.user?.headline}</p>
        </div>
      </Link>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        <Badge tone="neutral">{investor.investorType}</Badge>
        {investor.sectors.slice(0, 2).map((sector) => (
          <Badge key={sector} tone="neutral">
            {sector}
          </Badge>
        ))}
      </div>
      {(investor.ticketMin !== undefined || investor.ticketMax !== undefined) && (
        <p className="text-xs text-fg-muted font-medium pt-3 border-t border-border/60">
          Ticket:{' '}
          <span className="text-fg font-semibold">{investor.ticketMin !== undefined ? formatCurrency(investor.ticketMin) : 'Any'}</span> –{' '}
          <span className="text-fg font-semibold">{investor.ticketMax !== undefined ? formatCurrency(investor.ticketMax) : 'Any'}</span>
        </p>
      )}
    </Card>
  )
}
