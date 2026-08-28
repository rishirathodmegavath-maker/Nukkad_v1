import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Plus } from 'lucide-react'
import { listChapters } from '@/services/chapters.service'
import { ChapterCard } from '@/components/domain/ChapterCard'
import { PageHeader } from '@/components/domain/PageHeader'
import { SearchFilterBar } from '@/components/domain/SearchFilterBar'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function ChaptersListPage() {
  const [query, setQuery] = useState('')

  const { data: chapters, isLoading } = useQuery({ queryKey: ['chapters', query], queryFn: () => listChapters(query) })

  return (
    <div>
      <PageHeader
        title="Chapters"
        description="Find your local Nukkad community — meetups, chapter resources and leadership."
        action={
          <Link to="/chapters/new">
            <Button leftIcon={<Plus className="size-4" />}>Create a chapter</Button>
          </Link>
        }
      />

      <SearchFilterBar query={query} onQueryChange={setQuery} placeholder="Search chapters by name or city…" />

      {isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : chapters && chapters.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<MapPin className="size-5" />} title="No chapters match yet" />
      )}
    </div>
  )
}
