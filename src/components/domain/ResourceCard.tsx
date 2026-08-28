import { Link } from 'react-router-dom'
import { FileText, Link2, Video, StickyNote, LayoutTemplate, Bookmark } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Resource } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toggleSaveResource } from '@/services/resources.service'
import { cn } from '@/lib/utils'
import { toast } from '@/store/toast.store'

const typeIcon: Record<Resource['type'], typeof FileText> = {
  Document: FileText,
  Link: Link2,
  Video: Video,
  Note: StickyNote,
  Template: LayoutTemplate,
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = typeIcon[resource.type]
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: () => toggleSaveResource(resource.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['resource', resource.id] })
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not update save'),
  })

  return (
    <Card className="flex flex-col gap-3.5 rounded-xl border border-border/80 shadow-xs hover:border-border-strong transition-all bg-surface">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-surface-sunken text-fg-secondary border border-border/80 shrink-0">
          <Icon className="size-4.5" />
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge tone="neutral">{resource.type}</Badge>
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
            aria-label={resource.isSaved ? 'Remove from saved' : 'Save resource'}
            className={cn(
              'rounded-md p-1 transition-colors cursor-pointer disabled:opacity-50',
              resource.isSaved ? 'text-amber-500' : 'text-fg-muted hover:text-amber-500',
            )}
          >
            <Bookmark className={cn('size-4', resource.isSaved && 'fill-current')} />
          </button>
        </div>
      </div>
      <Link to={`/resources/${resource.id}`} className="flex-1">
        <h3 className="font-bold text-fg leading-snug text-base">{resource.title}</h3>
        <p className="text-sm text-fg-muted line-clamp-2 mt-1 leading-relaxed">{resource.description}</p>
      </Link>
      <Link
        to={`/resources/${resource.id}`}
        className="flex items-center gap-1.5 text-sm font-semibold text-fg-secondary hover:text-fg mt-auto pt-3 border-t border-border/60 transition-colors"
      >
        <span>View resource</span>
      </Link>
    </Card>
  )
}
