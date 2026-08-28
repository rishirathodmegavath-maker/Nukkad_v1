import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X, Undo2 } from 'lucide-react'
import { listIntroInbox, listIntroSent, acceptIntroRequest, rejectIntroRequest, withdrawIntroRequest } from '@/services/intro-requests.service'
import { PageHeader } from '@/components/domain/PageHeader'
import { PillTabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from '@/store/toast.store'
import type { IntroRequest, IntroRequestStatus } from '@/types'

const statusTone: Record<IntroRequestStatus, BadgeTone> = {
  Pending: 'info',
  Accepted: 'success',
  Rejected: 'danger',
  Withdrawn: 'neutral',
}

function RequestCard({
  request,
  isInbox,
  onAccept,
  onReject,
  onWithdraw,
  acceptPending,
  rejectPending,
  withdrawPending,
}: {
  request: IntroRequest
  isInbox: boolean
  onAccept: () => void
  onReject: () => void
  onWithdraw: () => void
  acceptPending: boolean
  rejectPending: boolean
  withdrawPending: boolean
}) {
  const person = isInbox ? request.requester : request.recipient
  const contextLabel = request.startupName ?? request.ideaTitle

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        {person ? (
          <Link to={`/people/${person.id}`} className="flex items-center gap-2.5 min-w-0 group">
            <Avatar src={person.avatarUrl} name={person.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-fg group-hover:underline transition-colors truncate">{person.name}</p>
              <p className="text-xs text-fg-muted truncate">{person.headline}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        <Badge tone={statusTone[request.status]}>{request.status}</Badge>
      </div>
      {contextLabel && (
        <p className="text-xs text-fg-muted">
          About: <span className="text-fg font-medium">{contextLabel}</span>
        </p>
      )}
      <p className="text-sm text-fg-muted">“{request.message}”</p>
      <p className="text-xs text-fg-muted">{formatRelativeTime(request.createdAt)}</p>

      {request.status === 'Pending' && isInbox && (
        <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
          <Button size="sm" variant="danger-subtle" leftIcon={<X className="size-3.5" />} isLoading={rejectPending} onClick={onReject}>
            Decline
          </Button>
          <Button size="sm" leftIcon={<Check className="size-3.5" />} isLoading={acceptPending} onClick={onAccept}>
            Accept
          </Button>
        </div>
      )}
      {request.status === 'Pending' && !isInbox && (
        <div className="pt-3 border-t border-border-subtle">
          <Button size="sm" variant="outline" leftIcon={<Undo2 className="size-3.5" />} isLoading={withdrawPending} onClick={onWithdraw}>
            Withdraw
          </Button>
        </div>
      )}
    </Card>
  )
}

export default function IntroRequestsPage() {
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox')
  const queryClient = useQueryClient()

  const inboxQuery = useQuery({ queryKey: ['intro-requests', 'inbox'], queryFn: listIntroInbox, enabled: tab === 'inbox' })
  const sentQuery = useQuery({ queryKey: ['intro-requests', 'sent'], queryFn: listIntroSent, enabled: tab === 'sent' })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['intro-requests'] })
  }

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptIntroRequest(id),
    onSuccess: () => {
      invalidate()
      toast.success('Introduction accepted')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not accept this request'),
  })
  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectIntroRequest(id),
    onSuccess: () => {
      invalidate()
      toast.info('Introduction declined')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not decline this request'),
  })
  const withdrawMutation = useMutation({
    mutationFn: (id: string) => withdrawIntroRequest(id),
    onSuccess: () => {
      invalidate()
      toast.info('Request withdrawn')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not withdraw this request'),
  })

  const data = tab === 'inbox' ? inboxQuery.data : sentQuery.data
  const isLoading = tab === 'inbox' ? inboxQuery.isLoading : sentQuery.isLoading

  return (
    <div>
      <PageHeader title="Introduction requests" description="Review requests you've sent and received." />
      <PillTabs
        items={[
          { key: 'inbox', label: 'Received' },
          { key: 'sent', label: 'Sent' },
        ]}
        value={tab}
        onChange={(k) => setTab(k as 'inbox' | 'sent')}
      />
      <div className="mt-6">
        {isLoading ? (
          <CardSkeletonGrid count={4} />
        ) : data && data.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                isInbox={tab === 'inbox'}
                onAccept={() => acceptMutation.mutate(r.id)}
                onReject={() => rejectMutation.mutate(r.id)}
                onWithdraw={() => withdrawMutation.mutate(r.id)}
                acceptPending={acceptMutation.isPending && acceptMutation.variables === r.id}
                rejectPending={rejectMutation.isPending && rejectMutation.variables === r.id}
                withdrawPending={withdrawMutation.isPending && withdrawMutation.variables === r.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState title={tab === 'inbox' ? 'No introduction requests yet' : "You haven't sent any requests yet"} />
        )}
      </div>
    </div>
  )
}
