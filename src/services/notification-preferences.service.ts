import { apiClient } from '@/lib/api-client'

export type NotificationType = 'connection' | 'idea_interest' | 'opportunity' | 'endorsement' | 'recommendation' | 'startup'

export type NotificationPreferences = Record<string, boolean>

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiClient.get<NotificationPreferences>('/users/me/notification-preferences')
}

export async function updateNotificationPreferences(
  updates: Partial<Record<NotificationType, boolean>>,
): Promise<NotificationPreferences> {
  return apiClient.patch<NotificationPreferences>('/users/me/notification-preferences', updates)
}
