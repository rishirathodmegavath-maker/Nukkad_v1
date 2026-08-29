import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Rocket } from 'lucide-react'
import { listStartups } from '@/services/startups.service'
import { StartupCard } from '@/components/domain/StartupCard'
import type { StartupStage } from '@/types'
import { PageHeader } from '@/components/domain/PageHeader'
import { SearchFilterBar } from '@/components/domain/SearchFilterBar'
import { PillTabs } from '@/components/ui/Tabs'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

const STAGE_FILTERS = [
  { key: 'all', label: 'All stages' },
  { key: 'Idea', label: 'Idea' },
  { key: 'MVP', label: 'MVP' },
  { key: 'Early Traction', label: 'Early Traction' },
  { key: 'Growth', label: 'Growth' },
  { key: 'Scaling', label: 'Scaling' },
]

export default function StartupsListPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [stage, setStage] = useState('all')
  const [raisingOnly, setRaisingOnly] = useState(false)

  const filters = useMemo(
    () => ({
      query: query || undefined,
      stage: stage === 'all' ? undefined : (stage as StartupStage),
      isRaising: raisingOnly ? true : undefined,
    }),
    [query, stage, raisingOnly],
  )

  const { data: startups, isLoading } = useQuery({ queryKey: ['startups', filters], queryFn: () => listStartups(filters) })

  return (
    <div>
      <PageHeader
        title="Startups"
        description="See what’s being built across the Nukkad network."
      />
      <SearchFilterBar query={query} onQueryChange={setQuery} placeholder="Search startups by name or sector…">
        <div className="flex flex-wrap items-center gap-3">
          <PillTabs items={STAGE_FILTERS} value={stage} onChange={setStage} />
          <button
            type="button"
            onClick={() => setRaisingOnly((v) => !v)}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium border cursor-pointer transition-all duration-150 active:scale-[0.98]',
              raisingOnly
                ? 'bg-accent-500 text-white border-accent-500 shadow-xs'
                : 'bg-surface text-fg-secondary border-border/80 hover:bg-surface-hover hover:border-border-strong hover:text-fg',
            )}
          >
            Raising now
          </button>
        </div>
      </SearchFilterBar>

      {isLoading ? (
        <CardSkeletonGrid count={6} />
      ) : startups && startups.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {startups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Rocket className="size-5" />} title="No startups match yet" description="Try a different search or clear your filters." />
      )}
    </div>
  )
}
