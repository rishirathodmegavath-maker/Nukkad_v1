import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, X } from 'lucide-react'
import { useConversations, useUnreadMessageCount } from '@/hooks/useConversations'
import { useUser } from '@/hooks/useUser'
import { getCurrentUserId } from '@/services/users.service'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Conversation } from '@/types'

function ConversationRow({ conversation, onOpen }: { conversation: Conversation; onOpen: (id: string) => void }) {
  const otherUserId = conversation.participantIds.find((p) => p !== getCurrentUserId())
  const { data: user } = useUser(otherUserId)
  const unread = conversation.lastMessage && conversation.lastMessage.senderId !== getCurrentUserId() && !conversation.lastMessage.isRead

  if (!user) return <Skeleton className="h-14 w-full rounded-lg" />

  return (
    <button
      onClick={() => onOpen(conversation.id)}
      className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg cursor-pointer hover:bg-surface-hover transition-colors"
    >
      <Avatar src={user.avatarUrl} name={user.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-sm truncate', unread ? 'font-semibold text-fg' : 'font-medium text-fg')}>{user.name}</p>
          {conversation.lastMessage && (
            <span className="text-[11px] text-fg-muted shrink-0">{formatRelativeTime(conversation.lastMessage.createdAt)}</span>
          )}
        </div>
        <p className={cn('text-xs truncate mt-0.5', unread ? 'text-fg font-medium' : 'text-fg-muted')}>
          {conversation.lastMessage?.content ?? 'Say hello'}
        </p>
      </div>
      {unread && <span className="size-2 rounded-full bg-brand-500 shrink-0" />}
    </button>
  )
}

export function MessengerWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: conversations, isLoading } = useConversations()
  const unreadCount = useUnreadMessageCount()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (location.pathname.startsWith('/messages')) return null

  const preview = conversations?.slice(0, 3) ?? []

  return (
    <div ref={ref} className="hidden lg:flex fixed bottom-5 right-5 z-40 flex-col items-end">
      {open && (
        <div className="mb-3 w-[360px] max-h-[460px] flex flex-col rounded-2xl border border-border/80 bg-surface shadow-xl overflow-hidden animate-in">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
            <p className="font-bold text-fg text-sm">Messages</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close messages preview"
              className="flex size-7 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : preview.length > 0 ? (
              preview.map((c) => (
                <ConversationRow
                  key={c.id}
                  conversation={c}
                  onOpen={(id) => {
                    setOpen(false)
                    navigate(`/messages/${id}`)
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-fg-muted text-center py-8">No conversations yet</p>
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false)
              navigate('/messages')
            }}
            className="border-t border-border-subtle px-4 py-2.5 text-sm font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
          >
            See all in Messages
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-2 rounded-full bg-surface border border-border shadow-lg pl-3 pr-4 py-2.5 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <MessageCircle className="size-5 text-fg" />
        <span className="text-sm font-semibold text-fg">Messages</span>
        {preview.length > 0 && (
          <span className="flex -space-x-2 ml-0.5">
            {preview.map((c) => {
              const otherUserId = c.participantIds.find((p) => p !== getCurrentUserId())
              return <MiniAvatar key={c.id} userId={otherUserId} />
            })}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white border-2 border-canvas">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}

function MiniAvatar({ userId }: { userId: string | undefined }) {
  const { data: user } = useUser(userId)
  if (!user) return null
  return <Avatar src={user.avatarUrl} name={user.name} size="xs" className="border-2 border-surface" />
}
