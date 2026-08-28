import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, Crown, Plus, ChevronRight, CheckCircle2 } from 'lucide-react'
import { getChapter, joinChapter } from '@/services/chapters.service'
import { listUsers } from '@/services/users.service'
import { listIdeas } from '@/services/ideas.service'
import { listStartups } from '@/services/startups.service'
import { listOpportunities } from '@/services/opportunities.service'
import { listEvents } from '@/services/events.service'
import { listResources } from '@/services/resources.service'
import { useUser } from '@/hooks/useUser'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState, EmptyState } from '@/components/ui/EmptyState'
import { PersonCard } from '@/components/domain/PersonCard'
import { IdeaCard } from '@/components/domain/IdeaCard'
import { StartupCard } from '@/components/domain/StartupCard'
import { OpportunityCard } from '@/components/domain/OpportunityCard'
import { EventCard } from '@/components/domain/EventCard'
import { ResourceCard } from '@/components/domain/ResourceCard'
import { toast } from '@/store/toast.store'

type TabKey = 'members' | 'ideas' | 'startups' | 'opportunities' | 'events' | 'resources'

export default function ChapterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<TabKey>('members')

  const { data: chapter, isLoading, isError, refetch } = useQuery({
    queryKey: ['chapter', id],
    queryFn: () => getChapter(id!),
    enabled: !!id,
  })

  const { data: president } = useUser(chapter?.presidentUserId)
  const { data: currentUser } = useCurrentUser()
  const canManageEvents = !!currentUser && currentUser.id === chapter?.presidentUserId

  const joinMutation = useMutation({
    mutationFn: () => joinChapter(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter', id] })
      toast.success(`Joined ${chapter?.name}`)
    },
  })

  const membersQuery = useQuery({
    queryKey: ['users', 'chapter', id],
    queryFn: () => listUsers({ chapterId: id }),
    enabled: tab === 'members' && !!id,
  })
  const ideasQuery = useQuery({
    queryKey: ['ideas', 'chapter', id],
    queryFn: () => listIdeas({ chapterId: id }),
    enabled: tab === 'ideas' && !!id,
  })
  const startupsQuery = useQuery({
    queryKey: ['startups', 'chapter', id],
    queryFn: () => listStartups({ chapterId: id }),
    enabled: tab === 'startups' && !!id,
  })
  const opportunitiesQuery = useQuery({
    queryKey: ['opportunities', 'chapter', id],
    queryFn: () => listOpportunities({ chapterId: id }),
    enabled: tab === 'opportunities' && !!id,
  })
  const eventsQuery = useQuery({
    queryKey: ['events', 'chapter', id],
    queryFn: () => listEvents({ chapterId: id }),
    enabled: tab === 'events' && !!id,
  })
  const resourcesQuery = useQuery({
    queryKey: ['resources', 'chapter', id],
    queryFn: () => listResources({ chapterId: id }),
    enabled: tab === 'resources' && !!id,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !chapter) {
    return <ErrorState title="Couldn’t load this chapter" onRetry={refetch} />
  }

  const isMember = !!currentUser && currentUser.chapterId === chapter.id

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-xs font-medium text-fg-muted">
        <Link to="/chapters" className="hover:text-fg transition-colors">
          Chapters
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-fg truncate max-w-sm">{chapter.name}</span>
      </div>

      <Card padding="none" className="overflow-hidden rounded-2xl border border-border/80 shadow-xs bg-surface">
        <div className="h-44 sm:h-56 w-full bg-surface-sunken overflow-hidden">
          {chapter.coverImageUrl ? (
            <img src={chapter.coverImageUrl} alt={chapter.name} className="size-full object-cover" />
          ) : (
            <div className="size-full bg-surface-sunken" />
          )}
        </div>
        <div className="p-6 sm:p-7 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black text-fg tracking-tight leading-tight mb-1.5">{chapter.name}</h1>
            <p className="text-sm text-fg-muted leading-relaxed max-w-xl">{chapter.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-fg-muted font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-fg-muted" /> {chapter.memberCount ?? 0} members
              </span>
              {president && (
                <Link to={`/people/${president.id}`} className="flex items-center gap-1.5 text-fg hover:underline group">
                  <Crown className="size-4 text-amber-500 shrink-0" />
                  <Avatar src={president.avatarUrl} name={president.name} size="xs" />
                  <span>{president.name} (President)</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {isMember ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="size-4" /> Member
              </span>
            ) : (
              <Button isLoading={joinMutation.isPending} onClick={() => joinMutation.mutate()}>
                Join chapter
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs
        value={tab}
        onChange={(k) => setTab(k as TabKey)}
        items={[
          { key: 'members', label: 'Members', count: chapter.memberCount ?? 0 },
          { key: 'ideas', label: 'Ideas', count: chapter.ideaCount ?? 0 },
          { key: 'startups', label: 'Startups', count: chapter.startupCount ?? 0 },
          { key: 'opportunities', label: 'Opportunities', count: chapter.opportunityCount ?? 0 },
          { key: 'events', label: 'Events', count: chapter.eventCount ?? 0 },
          { key: 'resources', label: 'Resources', count: chapter.resourceCount ?? 0 },
        ]}
      />

      {tab === 'members' &&
        (membersQuery.data && membersQuery.data.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {membersQuery.data.map((u) => (
              <PersonCard key={u.id} user={u} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No members joined this chapter yet"
            description="Be among the first founders and builders to represent this local hub."
          />
        ))}

      {tab === 'ideas' &&
        (ideasQuery.data && ideasQuery.data.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ideasQuery.data.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No ideas posted from this chapter yet"
            description="Explore ideas from other chapters, or pitch an idea to find co-founders."
            action={
              <Link to="/ideas/new">
                <Button size="sm" leftIcon={<Plus className="size-3.5" />}>
                  Pitch an Idea
                </Button>
              </Link>
            }
          />
        ))}

      {tab === 'startups' &&
        (startupsQuery.data && startupsQuery.data.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {startupsQuery.data.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No startups active in this chapter yet"
            description="Ventures built by members of this chapter will be highlighted here."
          />
        ))}

      {tab === 'opportunities' &&
        (opportunitiesQuery.data && opportunitiesQuery.data.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {opportunitiesQuery.data.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No open opportunities in this chapter right now"
            description="Internships, co-founder roles, and founding positions posted here will show up."
          />
        ))}

      {tab === 'events' && (
        <div>
          {canManageEvents && (
            <div className="flex justify-end mb-4">
              <Link to={`/events/new?chapterId=${chapter.id}`}>
                <Button size="sm" leftIcon={<Plus className="size-3.5" />}>
                  New chapter event
                </Button>
              </Link>
            </div>
          )}
          {eventsQuery.data && eventsQuery.data.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {eventsQuery.data.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No events scheduled for this chapter"
              description="Meetups, hackathons, and demo nights organized by this chapter will be shown here."
              action={
                canManageEvents ? (
                  <Link to={`/events/new?chapterId=${chapter.id}`}>
                    <Button size="sm" leftIcon={<Plus className="size-3.5" />}>
                      Create Chapter Event
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          )}
        </div>
      )}

      {tab === 'resources' &&
        (resourcesQuery.data && resourcesQuery.data.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {resourcesQuery.data.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No resources shared with this chapter yet"
            description="Templates, guides, and slide decks shared by members will appear here."
          />
        ))}
    </div>
  )
}
