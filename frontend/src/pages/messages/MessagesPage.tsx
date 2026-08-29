import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MessageSquare, Info, X, Bell, UserX, Flag, Trash2, ImageOff, ArrowLeft } from 'lucide-react'
import { useConversations, useMessages, useSendMessage, useMarkConversationRead } from '@/hooks/useConversations'
import { useUser } from '@/hooks/useUser'
import { getCurrentUserId } from '@/services/users.service'
import * as usersService from '@/services/users.service'
import * as messagesService from '@/services/messages.service'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ReportModal } from '@/components/domain/ReportModal'
import { toast } from '@/store/toast.store'
import { cn, formatRelativeTime, formatDateTime } from '@/lib/utils'
import type { Conversation, Message, User } from '@/types'

function SharedPostPreview({ message, conversationId }: { message: Message; conversationId: string }) {
  const post = message.sharedPost
  const { data: author } = useUser(post?.authorId)
  const image = post?.attachments.find((a) => a.kind === 'image')

  if (!post) {
    return (
      <div className="flex items-center gap-2 w-64 max-w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-3 text-fg-muted">
        <ImageOff className="size-4 shrink-0" />
        <span className="text-xs">This post is no longer available</span>
      </div>
    )
  }

  return (
    <Link
      to={`/feed/${post.id}`}
      state={{ from: `/messages/${conversationId}`, fromLabel: 'Back to chat' }}
      className="block w-64 max-w-full overflow-hidden rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover transition-colors"
    >
      {image && <img src={image.url} alt="" className="h-40 w-full object-cover" />}
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <Avatar src={author?.avatarUrl} name={author?.name ?? ''} size="xs" />
        <span className="text-xs font-semibold text-fg truncate">{author?.name}</span>
      </div>
      <p className="px-3 pb-3 pt-1 text-xs text-fg-secondary line-clamp-3">{post.content}</p>
    </Link>
  )
}

function ConversationListItem({ conversation, active }: { conversation: Conversation; active: boolean }) {
  const navigate = useNavigate()
  const otherUserId = conversation.participantIds.find((p) => p !== getCurrentUserId())
  const { data: user } = useUser(otherUserId)
  if (!user) return <Skeleton className="h-16 w-full rounded-lg" />

  const lastMessage = conversation.lastMessage
  const unread = lastMessage && lastMessage.senderId !== getCurrentUserId() && !lastMessage.isRead

  return (
    <button
      onClick={() => navigate(`/messages/${conversation.id}`)}
      className={cn(
        'flex items-center gap-3 w-full text-left px-3.5 py-3 rounded-lg cursor-pointer transition-colors',
        active ? 'bg-surface-selected' : 'hover:bg-surface-hover',
      )}
    >
      <Avatar src={user.avatarUrl} name={user.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-sm truncate', unread ? 'font-semibold text-fg' : 'font-medium text-fg')}>
            {conversation.nickname || user.name}
          </p>
          {lastMessage && <span className="text-xs text-fg-muted shrink-0">{formatRelativeTime(lastMessage.createdAt)}</span>}
        </div>
        <p className={cn('text-xs truncate mt-0.5', unread ? 'text-fg font-medium' : 'text-fg-muted')}>
          {lastMessage
            ? lastMessage.type === 'SHARED_POST'
              ? lastMessage.content
                ? `Shared a post · ${lastMessage.content}`
                : 'Shared a post'
              : lastMessage.content
            : 'Say hello'}
        </p>
      </div>
      {unread && <span className="size-2 rounded-full bg-brand-500 shrink-0" />}
    </button>
  )
}

interface MessageGroup {
  senderId: string
  messages: Message[]
}

function groupMessages(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  const GAP_MS = 60_000
  for (const msg of messages) {
    const last = groups[groups.length - 1]
    const lastMsg = last?.messages[last.messages.length - 1]
    if (last && last.senderId === msg.senderId && lastMsg && +new Date(msg.createdAt) - +new Date(lastMsg.createdAt) < GAP_MS) {
      last.messages.push(msg)
    } else {
      groups.push({ senderId: msg.senderId, messages: [msg] })
    }
  }
  return groups
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <span className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', on ? 'bg-brand-500' : 'bg-surface-sunken border border-border')}>
      <span
        className={cn(
          'absolute top-0.5 size-4 rounded-full bg-white transition-transform',
          on ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </span>
  )
}

function DetailsPanel({
  conversation,
  otherUser,
  onClose,
}: {
  conversation: Conversation
  otherUser: User
  onClose: () => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [nicknameDraft, setNicknameDraft] = useState(conversation.nickname ?? '')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const muteMutation = useMutation({
    mutationFn: () => messagesService.toggleMuteConversation(conversation.id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success(updated.muted ? 'Messages muted' : 'Messages unmuted')
    },
  })

  const nicknameMutation = useMutation({
    mutationFn: () => messagesService.setConversationNickname(conversation.id, nicknameDraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Nickname saved')
    },
  })

  const blockMutation = useMutation({
    mutationFn: () => usersService.blockUser(otherUser.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowBlockModal(false)
      toast.success(`Blocked ${otherUser.name}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => messagesService.deleteConversation(conversation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setShowDeleteModal(false)
      navigate('/messages', { replace: true })
      toast.success('Chat deleted')
    },
  })

  return (
    <div className="hidden lg:flex w-[280px] shrink-0 border-l border-border-subtle flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-subtle">
        <p className="font-semibold text-fg text-sm">Details</p>
        <button onClick={onClose} className="text-fg-muted hover:text-fg cursor-pointer">
          <X className="size-4" />
        </button>
      </div>

      <button
        onClick={() => muteMutation.mutate()}
        disabled={muteMutation.isPending}
        className="flex items-center justify-between px-4 py-3.5 border-b border-border-subtle hover:bg-surface-hover cursor-pointer disabled:opacity-50"
      >
        <span className="flex items-center gap-2.5 text-sm text-fg">
          <Bell className="size-4" /> Mute messages
        </span>
        <ToggleSwitch on={conversation.muted} />
      </button>

      <div className="px-4 py-3.5 border-b border-border-subtle">
        <p className="text-xs font-semibold text-fg-muted mb-2.5">Members</p>
        <Link to={`/people/${otherUser.id}`} className="flex items-center gap-2.5 hover:opacity-80">
          <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="sm" />
          <span className="text-sm text-fg">{otherUser.name}</span>
        </Link>
      </div>

      <div className="px-4 py-3.5 border-b border-border-subtle flex flex-col gap-2">
        <p className="text-xs font-semibold text-fg-muted">Nickname</p>
        <div className="flex gap-2">
          <input
            value={nicknameDraft}
            onChange={(e) => setNicknameDraft(e.target.value)}
            placeholder={otherUser.name}
            className="flex-1 min-w-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
          />
          <Button size="sm" variant="secondary" isLoading={nicknameMutation.isPending} onClick={() => nicknameMutation.mutate()}>
            Save
          </Button>
        </div>
      </div>

      <button
        onClick={() => setShowBlockModal(true)}
        className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border-subtle text-sm text-fg hover:bg-surface-hover cursor-pointer text-left"
      >
        <UserX className="size-4" /> Block
      </button>
      <button
        onClick={() => setShowReportModal(true)}
        className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border-subtle text-sm text-danger-500 hover:bg-surface-hover cursor-pointer text-left"
      >
        <Flag className="size-4" /> Report
      </button>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="flex items-center gap-2.5 px-4 py-3.5 text-sm text-danger-500 hover:bg-surface-hover cursor-pointer text-left"
      >
        <Trash2 className="size-4" /> Delete chat
      </button>

      <Modal open={showBlockModal} onClose={() => setShowBlockModal(false)} size="sm">
        <div className="flex flex-col items-center text-center gap-2 pb-4">
          <p className="text-lg font-semibold text-fg">Block {otherUser.name}?</p>
          <p className="text-sm text-fg-muted">
            They won't be able to message you or find your profile. They won't be notified that you blocked them.
          </p>
        </div>
        <div className="-mx-5 -mb-5 border-t border-border-subtle flex flex-col">
          <button
            onClick={() => blockMutation.mutate()}
            disabled={blockMutation.isPending}
            className="py-3 text-sm font-semibold text-danger-500 hover:bg-surface-hover cursor-pointer border-b border-border-subtle disabled:opacity-50"
          >
            {blockMutation.isPending ? 'Blocking…' : 'Block'}
          </button>
          <button onClick={() => setShowBlockModal(false)} className="py-3 text-sm text-fg hover:bg-surface-hover cursor-pointer">
            Cancel
          </button>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm">
        <div className="flex flex-col items-center text-center gap-2 pb-4">
          <p className="text-lg font-semibold text-fg">Delete chat from inbox?</p>
          <p className="text-sm text-fg-muted">
            This removes the chat from your inbox and erases your chat history. {otherUser.name} keeps their own copy.
          </p>
        </div>
        <div className="-mx-5 -mb-5 border-t border-border-subtle flex flex-col">
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="py-3 text-sm font-semibold text-danger-500 hover:bg-surface-hover cursor-pointer border-b border-border-subtle disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={() => setShowDeleteModal(false)} className="py-3 text-sm text-fg hover:bg-surface-hover cursor-pointer">
            Cancel
          </button>
        </div>
      </Modal>

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={otherUser.id}
        conversationId={conversation.id}
      />
    </div>
  )
}

function ChatPanel({ conversationId }: { conversationId: string }) {
  const navigate = useNavigate()
  const { data: conversations } = useConversations()
  const currentConversation = conversations?.find((c) => c.id === conversationId)
  const otherUserId = currentConversation?.participantIds.find((p) => p !== getCurrentUserId())
  const { data: otherUser } = useUser(otherUserId)
  const { data: messages, isLoading } = useMessages(conversationId)
  const sendMutation = useSendMessage(conversationId)
  const markReadMutation = useMarkConversationRead(conversationId)
  const markRead = markReadMutation.mutate
  const [draft, setDraft] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const myId = getCurrentUserId()

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)
  const lastScrolledConversationRef = useRef<string | null>(null)

  useEffect(() => {
    markRead()
  }, [conversationId, markRead])

  function handleScroll() {
    const el = scrollContainerRef.current
    if (!el) return
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  useEffect(() => {
    if (!messages) return
    // Opening or switching to a conversation always jumps straight to the latest message —
    // the scroll container otherwise defaults to the top (oldest messages) on every mount.
    const isNewConversation = lastScrolledConversationRef.current !== conversationId
    if (isNewConversation) {
      lastScrolledConversationRef.current = conversationId
      isNearBottomRef.current = true
    }
    if (isNewConversation || isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: isNewConversation ? 'auto' : 'smooth' })
    }
  }, [conversationId, messages])

  function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    sendMutation.mutate(draft.trim())
    setDraft('')
  }

  const groups = messages ? groupMessages(messages) : []

  return (
    <div className="flex h-full flex-1 min-w-0">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-border/70 bg-surface">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate('/messages')}
              className="sm:hidden flex size-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-hover hover:text-fg -ml-1 cursor-pointer transition-colors"
              aria-label="Back to messages"
            >
              <ArrowLeft className="size-5" />
            </button>
            {otherUser && (
              <Link to={`/people/${otherUser.id}`} className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
                <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="sm" />
                <p className="font-bold text-fg text-sm truncate">{currentConversation?.nickname || otherUser.name}</p>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setDetailsOpen((o) => !o)}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg cursor-pointer transition-colors',
                detailsOpen ? 'bg-surface-selected text-brand-600' : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
              )}
              aria-label="Conversation details"
            >
              <Info className="size-4.5" />
            </button>
          </div>
        </div>

        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 sm:px-8 py-4">
          <div className="max-w-[900px] mx-auto flex flex-col w-full">
            {isLoading ? (
              <Skeleton className="h-10 w-2/3 rounded-lg" />
            ) : (
              groups.map((group, gi) => (
                <div key={gi} className="flex flex-col gap-0.5 mb-3">
                  <div className="flex justify-center mb-2">
                    <span className="text-[11px] text-fg-muted font-medium">{formatDateTime(group.messages[0].createdAt)}</span>
                  </div>
                  {group.messages.map((msg, mi) => {
                    const isOwn = msg.senderId === myId
                    const isLast = mi === group.messages.length - 1
                    return (
                      <div key={msg.id} className={cn('flex items-end gap-2', isOwn ? 'self-end flex-row-reverse' : 'self-start')}>
                        {!isOwn &&
                          (isLast ? (
                            <Avatar src={otherUser?.avatarUrl} name={otherUser?.name ?? ''} size="xs" />
                          ) : (
                            <span className="size-6 shrink-0" />
                          ))}
                        {msg.type === 'SHARED_POST' ? (
                          <div className="flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]">
                            <SharedPostPreview message={msg} conversationId={conversationId} />
                            {msg.content && (
                              <div
                                className={cn(
                                  'rounded-2xl px-4 py-2.5 text-sm self-start leading-relaxed',
                                  isOwn ? 'bg-brand-600 text-white rounded-br-sm self-end' : 'bg-surface-sunken text-fg rounded-bl-sm border border-border/60',
                                )}
                              >
                                {msg.content}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                              isOwn ? 'bg-brand-600 text-white rounded-br-sm shadow-2xs' : 'bg-surface-sunken text-fg rounded-bl-sm border border-border/60',
                            )}
                          >
                            {msg.content}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {currentConversation?.blocked ? (
          <div className="px-4 py-4 border-t border-border/70 text-center text-sm text-fg-muted bg-surface-sunken/40">
            You can't reply to this conversation
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border/70 bg-surface">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              className="flex-1 rounded-full border border-border bg-surface-sunken/70 px-4 py-2.5 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-fg-muted"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex size-10 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 cursor-pointer shrink-0 transition-all active:scale-95 shadow-xs"
            >
              <Send className="size-4" />
            </button>
          </form>
        )}
      </div>

      {detailsOpen && currentConversation && otherUser && (
        <DetailsPanel conversation={currentConversation} otherUser={otherUser} onClose={() => setDetailsOpen(false)} />
      )}
    </div>
  )
}

export default function MessagesPage() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const { data: conversations, isLoading, refetch } = useConversations()

  useEffect(() => {
    // Only auto-select a conversation on wider desktop screens (>= 640px)
    if (typeof window === 'undefined' || window.innerWidth < 640) return
    if (conversationId) return

    let cancelled = false
    // Resolve against a fresh fetch rather than whatever `['conversations']` has cached
    // (staleTime: 15s, refetchOnWindowFocus: false) — a socket reconnect that missed an
    // update would otherwise land the auto-redirect on a stale "most recent" conversation,
    // and it never re-fires afterward since conversationId is then already set.
    refetch().then((result) => {
      if (cancelled) return
      const list = result.data
      if (list && list.length > 0) {
        navigate(`/messages/${list[0].id}`, { replace: true })
      }
    })
    return () => {
      cancelled = true
    }
  }, [conversationId, navigate, refetch])

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
      {/* Left conversation list */}
      <div
        className={cn(
          'w-full sm:w-[320px] lg:w-[360px] shrink-0 border-r border-border/70 overflow-y-auto p-3 flex-col',
          conversationId ? 'hidden sm:flex' : 'flex',
        )}
      >
        <div className="flex items-center justify-between px-2 py-2 mb-1">
          <h1 className="text-lg font-bold text-fg tracking-tight">Messages</h1>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-1">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="flex flex-col gap-1">
            {conversations.map((c) => (
              <ConversationListItem key={c.id} conversation={c} active={c.id === conversationId} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<MessageSquare className="size-5" />} title="No conversations yet" className="border-none py-10" />
        )}
      </div>

      {/* Right chat panel */}
      <div
        className={cn(
          'flex-1 min-w-0 h-full',
          conversationId ? 'flex' : 'hidden sm:flex',
        )}
      >
        {conversationId ? (
          <ChatPanel conversationId={conversationId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-fg-muted text-sm gap-2.5 p-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-sunken text-fg-muted border border-border/60">
              <MessageSquare className="size-6" />
            </div>
            <p className="font-semibold text-fg">Your Messages</p>
            <p className="text-xs text-fg-muted max-w-xs">Select a conversation from the list to continue chatting with fellow builders.</p>
          </div>
        )}
      </div>
    </div>
  )
}
