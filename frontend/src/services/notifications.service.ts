import { apiClient, getPage } from '@/lib/api-client'
import type { NukkadNotification } from '@/types'

export async function listNotifications(): Promise<NukkadNotification[]> {
  return getPage<NukkadNotification>('/notifications')
}

export async function unreadCount(): Promise<number> {
  const result = await apiClient.get<{ count: number }>('/notifications/unread-count')
  return result.count
}

export async function markRead(id: string): Promise<NukkadNotification> {
  return apiClient.patch<NukkadNotification>(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all')
}
