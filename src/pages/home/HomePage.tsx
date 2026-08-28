import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Lightbulb, Rocket, Briefcase, Users, ArrowRight, CalendarDays } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { listIdeas } from '@/services/ideas.service'
import { listStartups } from '@/services/startups.service'
import { listOpportunities } from '@/services/opportunities.service'
import { listEvents } from '@/services/events.service'
import { getChapter } from '@/services/chapters.service'
import { IdeaCard } from '@/components/domain/IdeaCard'
import { StartupCard } from '@/components/domain/StartupCard'
import { OpportunityCard } from '@/components/domain/OpportunityCard'
import { EventCard } from '@/components/domain/EventCard'
import { StatTile } from '@/components/domain/StatTile'
import { SuggestedForYou } from '@/components/domain/SuggestedForYou'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'

function SectionHeading({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      <Link to={to} className="flex items-center gap-1 text-sm font-semibold text-fg hover:underline">
        View all <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

export default function HomePage() {
  const { data: currentUser } = useCurrentUser()

  const ideasQuery = useQuery({ queryKey: ['ideas', 'home'], queryFn: () => listIdeas() })
  const startupsQuery = useQuery({ queryKey: ['startups', 'home'], queryFn: () => listStartups() })
  const opportunitiesQuery = useQuery({ queryKey: ['opportunities', 'home'], queryFn: () => listOpportunities() })
  const eventsQuery = useQuery({ queryKey: ['events', 'upcoming'], queryFn: () => listEvents({ upcoming: true }) })
  const chapterQuery = useQuery({
    queryKey: ['chapter', currentUser?.chapterId],
    queryFn: () => getChapter(currentUser!.chapterId!),
    enabled: !!currentUser?.chapterId,
  })

  const matchedIdeas = ideasQuery.data?.filter((idea) =>
    currentUser?.skills.some((skill) => idea.helpNeeded.some((h) => h.toLowerCase().includes(skill.toLowerCase()))),
  )
  const recommendedIdeas = (matchedIdeas && matchedIdeas.length > 0 ? matchedIdeas : ideasQuery.data)?.slice(0, 3)

  const matchedOpportunities = opportunitiesQuery.data?.filter((opp) =>
    currentUser?.lookingFor.some((lf) => opp.type.toLowerCase().includes(lf.toLowerCase().split(' ')[0])),
  )
  const recommendedOpportunities = (matchedOpportunities && matchedOpportunities.length > 0
    ? matchedOpportunities
    : opportunitiesQuery.data
  )?.slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-fg tracking-tight">
          {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Welcome back'}
        </h1>
        <p className="text-sm text-fg-muted mt-1">Here’s what’s worth your time on Nukkad today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={<Users className="size-5" />} label="Connections" value={currentUser?.connectionsCount ?? '—'} />
        <StatTile icon={<Lightbulb className="size-5" />} label="Ideas live" value={ideasQuery.data?.length ?? '—'} />
        <StatTile icon={<Rocket className="size-5" />} label="Startups building" value={startupsQuery.data?.length ?? '—'} />
        <StatTile icon={<Briefcase className="size-5" />} label="Open opportunities" value={opportunitiesQuery.data?.length ?? '—'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <section>
            <SectionHeading title="Ideas worth building" to="/ideas" />
            {ideasQuery.isLoading ? (
              <CardSkeletonGrid count={3} />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendedIdeas?.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading title="Opportunities matched to you" to="/opportunities" />
            {opportunitiesQuery.isLoading ? (
              <CardSkeletonGrid count={3} />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendedOpportunities?.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading title="Startups building right now" to="/startups" />
            {startupsQuery.isLoading ? (
              <CardSkeletonGrid count={3} />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {startupsQuery.data?.slice(0, 4).map((startup) => (
                  <StartupCard key={startup.id} startup={startup} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <SuggestedForYou limit={5} />
          </section>

          <section>
            <SectionHeading title="Upcoming events" to="/events" />
            <div className="flex flex-col gap-3">
              {eventsQuery.data?.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          {chapterQuery.data && (
            <section>
              <SectionHeading title="Your chapter" to={`/chapters/${chapterQuery.data.id}`} />
              <Card className="flex flex-col gap-2">
                <p className="font-semibold text-fg">{chapterQuery.data.name}</p>
                <p className="text-sm text-fg-muted line-clamp-2">{chapterQuery.data.description}</p>
                <p className="text-xs text-fg-muted flex items-center gap-1.5 mt-1">
                  <CalendarDays className="size-3.5" /> {chapterQuery.data.eventCount ?? 0} chapter events
                </p>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
