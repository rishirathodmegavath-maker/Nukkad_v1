import type { Post } from '@/types/feed'

export type MessageType = 'TEXT' | 'SHARED_POST'
export type ConversationType = 'DIRECT' | 'GROUP'
export type GroupRole = 'ADMIN' | 'MEMBER'

export interface RepliedMessagePreview {
  id: string
  senderId: string
  type: MessageType
  contentSnippet: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  type: MessageType
  content: string
  sharedPostId?: string
  sharedPost?: Post
  replyToMessageId?: string
  replyTo?: RepliedMessagePreview
  createdAt: string
  isRead: boolean
}

export interface GroupParticipant {
  userId: string
  role: GroupRole
}

export interface GroupInfo {
  name: string
  avatarUrl?: string
  createdBy: string
  myRole: GroupRole
  participants: GroupParticipant[]
}

export interface Conversation {
  id: string
  type: ConversationType
  participantIds: string[]
  group?: GroupInfo
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
  muted: boolean
  nickname?: string
  blocked: boolean
}
