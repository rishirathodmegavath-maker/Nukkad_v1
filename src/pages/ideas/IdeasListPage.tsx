import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Lightbulb, Plus } from 'lucide-react'
import { listIdeas } from '@/services/ideas.service'
import { IdeaCard } from '@/components/domain/IdeaCard'
import { PageHeader } from '@/components/domain/PageHeader'
import { SearchFilterBar } from '@/components/domain/SearchFilterBar'
import { PillTabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { IdeaStage } from '@/types'

const STAGE_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All stages' },
  { key: 'Concept', label: 'Concept' },
  { key: 'Validating', label: 'Validating' },
  { key: 'Building', label: 'Building' },
  { key: 'Launched', label: 'Launched' },
]

export default function IdeasListPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [stage, setStage] = useState('all')

  const filters = useMemo(
    () => ({ query: query || undefined, stage: stage === 'all' ? undefined : (stage as IdeaStage) }),
    [query, stage],
  )

  const { data: ideas, isLoading } = useQuery({ queryKey: ['ideas', filters], queryFn: () => listIdeas(filters) })

  return (
    <div>
      <PageHeader
        title="Ideas"
        description="Browse what builders are exploring — or post your own and find a team."
        action={
          <Link to="/ideas/new">
            <Button leftIcon={<Plus className="size-4" />}>Post an idea</Button>
          </Link>
        }
      />
      <SearchFilterBar query={query} onQueryChange={setQuery} placeholder="Search ideas by title or problem…">
        <PillTabs items={STAGE_FILTERS} value={stage} onChange={setStage} />
      </SearchFilterBar>

      {isLoading ? (
        <CardSkeletonGrid count={6} />
      ) : ideas && ideas.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Lightbulb className="size-5" />}
          title="No ideas match yet"
          description="Try a different search, or be the first to post one."
          action={
            <Link to="/ideas/new">
              <Button size="sm">Post an idea</Button>
            </Link>
          }
        />
      )}
    </div>
  )
}
