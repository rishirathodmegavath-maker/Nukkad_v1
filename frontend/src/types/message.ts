import type { Post } from '@/types/feed'

export type MessageType = 'TEXT' | 'SHARED_POST'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  type: MessageType
  content: string
  sharedPostId?: string
  sharedPost?: Post
  createdAt: string
  isRead: boolean
}

export interface Conversation {
  id: string
  participantIds: string[]
  lastMessage?: Message
  updatedAt: string
  muted: boolean
  nickname?: string
  blocked: boolean
}
