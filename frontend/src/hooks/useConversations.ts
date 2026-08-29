import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as messagesService from '@/services/messages.service'
import { getCurrentUserId } from '@/services/users.service'
import { subscribeToConversation, subscribeToUserConversations } from '@/lib/socket-client'
import type { Conversation, Message } from '@/types'
import { mapConversation, mapMessage, type ConversationDto, type MessageDto } from '@/services/messages.service'

export function useConversations() {
  const queryClient = useQueryClient()
  const myId = getCurrentUserId()

  useEffect(() => {
    if (!myId) return
    return subscribeToUserConversations<ConversationDto>(myId, (dto) => {
      const updated = mapConversation(dto)
      queryClient.setQueryData<Conversation[]>(['conversations'], (existing) => {
        if (!existing) return [updated]
        const idx = existing.findIndex((c) => c.id === updated.id)
        if (idx === -1) return [updated, ...existing]
        const next = [...existing]
        next[idx] = updated
        return next.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      })
    })
  }, [myId, queryClient])

  return useQuery({
    queryKey: ['conversations'],
    queryFn: messagesService.listConversations,
  })
}

export function useUnreadMessageCount() {
  const myId = getCurrentUserId()
  const { data } = useConversations()
  if (!data) return 0
  return data.filter((c) => c.lastMessage && c.lastMessage.senderId !== myId && !c.lastMessage.isRead).length
}

export function useMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId) return
    return subscribeToConversation<MessageDto>(conversationId, (dto) => {
      const incoming = mapMessage(dto)
      queryClient.setQueryData<Message[]>(['messages', conversationId], (existing) => {
        if (!existing) return [incoming]
        if (existing.some((m) => m.id === incoming.id)) return existing
        return [...existing, incoming]
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })
  }, [conversationId, queryClient])

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesService.listMessages(conversationId!),
    enabled: !!conversationId,
  })
}

export function useSendMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => messagesService.sendMessage(conversationId!, content),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], (existing) =>
        existing ? [...existing.filter((m) => m.id !== message.id), message] : [message],
      )
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useMarkConversationRead(conversationId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => messagesService.markConversationRead(conversationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
