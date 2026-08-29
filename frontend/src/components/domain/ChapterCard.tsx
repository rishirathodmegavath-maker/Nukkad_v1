import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import type { Chapter } from '@/types'
import { Card } from '@/components/ui/Card'

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <Card interactive padding="none" className="overflow-hidden rounded-xl border border-border/80 shadow-xs hover:border-border-strong transition-all flex flex-col bg-surface">
      <Link to={`/chapters/${chapter.id}`} className="flex flex-col h-full">
        <div className="h-32 w-full overflow-hidden bg-surface-sunken relative">
          {chapter.coverImageUrl ? (
            <img src={chapter.coverImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-gradient-to-br from-brand-500/10 via-surface-sunken to-accent-500/10" />
          )}
        </div>
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-fg text-base leading-snug">{chapter.name}</h3>
            <p className="text-sm text-fg-muted line-clamp-2 mt-1 leading-relaxed">{chapter.description}</p>
          </div>
          <p className="text-xs text-fg-secondary font-medium flex items-center gap-1.5 mt-3 pt-3 border-t border-border/60">
            <Users className="size-3.5" /> {chapter.memberCount ?? 0} members
          </p>
        </div>
      </Link>
    </Card>
  )
}
