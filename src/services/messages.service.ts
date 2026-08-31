import { apiClient, getPage } from '@/lib/api-client'
import { getCurrentUserId } from '@/services/users.service'
import { mapPost, type PostDto } from '@/services/feed.service'
import type { Conversation, Message, MessageType } from '@/types'

export interface MessageDto {
  id: string
  conversationId: string
  senderId: string
  type: string
  content: string
  sharedPostId: string | null
  sharedPost: PostDto | null
  isRead: boolean
  createdAt: string
}

export interface ConversationDto {
  id: string
  otherUserId: string
  lastMessage: MessageDto | null
  unreadCount: number
  updatedAt: string
  muted: boolean
  nickname: string | null
  blocked: boolean
}

/** Exported so live WebSocket pushes (raw backend DTO shape) can be mapped before entering the query cache. */
export function mapMessage(dto: MessageDto): Message {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    senderId: dto.senderId,
    type: dto.type as MessageType,
    content: dto.content,
    sharedPostId: dto.sharedPostId ?? undefined,
    sharedPost: dto.sharedPost ? mapPost(dto.sharedPost) : undefined,
    createdAt: dto.createdAt,
    isRead: dto.isRead,
  }
}

/** Exported so live WebSocket pushes (raw backend DTO shape) can be mapped before entering the query cache. */
export function mapConversation(dto: ConversationDto): Conversation {
  const me = getCurrentUserId() ?? ''
  return {
    id: dto.id,
    participantIds: [me, dto.otherUserId],
    lastMessage: dto.lastMessage ? mapMessage(dto.lastMessage) : undefined,
    updatedAt: dto.updatedAt,
    muted: dto.muted,
    nickname: dto.nickname ?? undefined,
    blocked: dto.blocked,
  }
}

export async function listConversations(): Promise<Conversation[]> {
  const dtos = await getPage<ConversationDto>('/conversations')
  return dtos.map(mapConversation)
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  const conversations = await listConversations()
  return conversations.find((c) => c.id === id)
}

export async function getOrCreateConversationWith(otherUserId: string): Promise<Conversation> {
  const dto = await apiClient.post<ConversationDto>('/conversations', { otherUserId })
  return mapConversation(dto)
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const dtos = await getPage<MessageDto>(`/conversations/${conversationId}/messages`)
  return dtos.map(mapMessage)
}

export async function sendMessage(conversationId: string, content: string, sharedPostId?: string): Promise<Message> {
  const dto = await apiClient.post<MessageDto>(`/conversations/${conversationId}/messages`, { content, sharedPostId })
  return mapMessage(dto)
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await apiClient.patch(`/conversations/${conversationId}/read`)
}

export async function toggleMuteConversation(conversationId: string): Promise<Conversation> {
  const dto = await apiClient.patch<ConversationDto>(`/conversations/${conversationId}/mute`)
  return mapConversation(dto)
}

export async function setConversationNickname(conversationId: string, nickname: string): Promise<Conversation> {
  const dto = await apiClient.patch<ConversationDto>(`/conversations/${conversationId}/nickname`, { nickname })
  return mapConversation(dto)
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await apiClient.delete(`/conversations/${conversationId}`)
}

/** "Delete for me": hides this message from the current user's own view only — the other participant still sees it. */
export async function hideMessageForMe(conversationId: string, messageId: string): Promise<void> {
  await apiClient.delete(`/conversations/${conversationId}/messages/${messageId}`)
}

/** Bulk "delete for me": hides the given messages from the current user's own view only. */
export async function hideMessagesForMe(conversationId: string, messageIds: string[]): Promise<void> {
  const query = messageIds.map((id) => `messageIds=${encodeURIComponent(id)}`).join('&')
  await apiClient.delete(`/conversations/${conversationId}/messages?${query}`)
}
