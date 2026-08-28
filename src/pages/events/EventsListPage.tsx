import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Plus } from 'lucide-react'
import { listEvents } from '@/services/events.service'
import { EventCard } from '@/components/domain/EventCard'
import { PageHeader } from '@/components/domain/PageHeader'
import { PillTabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function EventsListPage() {
  const navigate = useNavigate()
  const [upcomingOnly, setUpcomingOnly] = useState(true)
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', upcomingOnly],
    queryFn: () => listEvents({ upcoming: upcomingOnly }),
  })

  return (
    <div>
      <PageHeader
        title="Events"
        description="Demo nights, meetups, and your own meets — hosted by anyone."
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate('/events/new')}>
            Start an event
          </Button>
        }
      />
      <div className="mb-6">
        <PillTabs
          items={[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'all', label: 'All events' },
          ]}
          value={upcomingOnly ? 'upcoming' : 'all'}
          onChange={(k) => setUpcomingOnly(k === 'upcoming')}
        />
      </div>

      {isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : events && events.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays className="size-5" />}
          title={upcomingOnly ? 'No upcoming events scheduled' : 'No events found'}
          description={
            upcomingOnly
              ? 'Be the first to host a demo night, founder meetup, or workshop for your local ecosystem.'
              : 'Events organized by members and university chapters will show up here.'
          }
          action={
            <Button size="sm" leftIcon={<Plus className="size-3.5" />} onClick={() => navigate('/events/new')}>
              Host an Event
            </Button>
          }
        />
      )}
    </div>
  )
}
