import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import { getStoredSession } from '@/lib/session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
/** Derives the STOMP endpoint from the REST API base URL — http(s) -> ws(s), strip trailing /api. */
const WS_URL = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '') + '/ws/websocket'

let client: Client | null = null

function getClient(): Client {
  if (client) return client
  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: { Authorization: `Bearer ${getStoredSession()?.token ?? ''}` },
    reconnectDelay: 3000,
    beforeConnect: () => {
      client!.connectHeaders = { Authorization: `Bearer ${getStoredSession()?.token ?? ''}` }
    },
  })
  client.activate()
  return client
}

function subscribe<T>(destination: string, onMessage: (payload: T) => void): () => void {
  const c = getClient()
  let sub: StompSubscription | null = null
  let cancelled = false

  const doSubscribe = () => {
    if (cancelled) return
    sub = c.subscribe(destination, (message: IMessage) => {
      onMessage(JSON.parse(message.body) as T)
    })
  }

  if (c.connected) doSubscribe()
  const onConnect = c.onConnect
  c.onConnect = (frame) => {
    onConnect?.(frame)
    doSubscribe()
  }

  return () => {
    cancelled = true
    sub?.unsubscribe()
  }
}

export function subscribeToConversation<T>(conversationId: string, onMessage: (payload: T) => void) {
  return subscribe<T>(`/topic/conversations/${conversationId}`, onMessage)
}

export function subscribeToConversationReads(conversationId: string, onRead: (payload: { readBy: string }) => void) {
  return subscribe(`/topic/conversations/${conversationId}/read`, onRead)
}

export function subscribeToUserConversations<T>(userId: string, onUpdate: (payload: T) => void) {
  return subscribe<T>(`/topic/users/${userId}/conversations`, onUpdate)
}
