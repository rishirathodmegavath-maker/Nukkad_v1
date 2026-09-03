import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Inbox, MapPin, Briefcase } from 'lucide-react'
import { listMyApplications, withdrawApplication } from '@/services/opportunities.service'
import { PageHeader } from '@/components/domain/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { toast } from '@/store/toast.store'
import type { ApplicationStatus } from '@/types'

const STATUS_TONE: Record<ApplicationStatus, BadgeTone> = {
  Pending: 'info',
  Shortlisted: 'brand',
  Accepted: 'success',
  Rejected: 'danger',
  Withdrawn: 'neutral',
}

export default function MyApplicationsPage() {
  const queryClient = useQueryClient()
  const { data: opportunities, isLoading, isError, refetch } = useQuery({
    queryKey: ['opportunities', 'mine', 'applications'],
    queryFn: listMyApplications,
  })

  const withdrawMutation = useMutation({
    mutationFn: (opportunityId: string) => withdrawApplication(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'mine', 'applications'] })
      toast.info('Application withdrawn')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not withdraw'),
  })

  return (
    <div>
      <PageHeader title="My Applications" description="Opportunities you've applied to or expressed interest in." />

      {isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : isError ? (
        <ErrorState title="Couldn't load your applications" onRetry={refetch} />
      ) : !opportunities || opportunities.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" />}
          title="No applications yet"
          description="Opportunities you apply to or express interest in will show up here."
          action={
            <Link to="/opportunities">
              <Button size="sm">Browse opportunities</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {opportunities.map((opp) => {
            const status = opp.applicationStatus
            const canWithdraw = status === 'Pending' || status === 'Shortlisted'
            return (
              <Card key={opp.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-fg text-base leading-snug truncate">{opp.title}</h3>
                    <p className="text-sm text-fg-muted flex items-center gap-1.5 mt-1 font-medium truncate">
                      <Briefcase className="size-3.5 shrink-0" /> {opp.organizationName}
                    </p>
                    {opp.location && (
                      <p className="text-xs text-fg-muted flex items-center gap-1.5 mt-1 truncate">
                        <MapPin className="size-3.5 shrink-0" /> {opp.location}
                      </p>
                    )}
                  </div>
                  {status ? (
                    <Badge tone={STATUS_TONE[status]} className="shrink-0">
                      {status}
                    </Badge>
                  ) : (
                    <Badge tone="neutral" className="shrink-0">
                      Interested
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  <Link to={`/opportunities/${opp.id}`}>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </Link>
                  {canWithdraw && (
                    <Button
                      size="sm"
                      variant="danger-subtle"
                      isLoading={withdrawMutation.isPending}
                      onClick={() => withdrawMutation.mutate(opp.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
