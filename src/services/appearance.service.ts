import { apiClient } from '@/lib/api-client'
import type { AppearanceSettings } from '@/types'

export async function getAppearanceSettings(): Promise<AppearanceSettings> {
  return apiClient.get<AppearanceSettings>('/users/me/appearance')
}

export async function updateAppearanceSettings(updates: Partial<AppearanceSettings>): Promise<AppearanceSettings> {
  return apiClient.patch<AppearanceSettings>('/users/me/appearance', updates)
}

export async function resetAppearanceSettings(): Promise<AppearanceSettings> {
  return apiClient.patch<AppearanceSettings>('/users/me/appearance', { resetToDefault: true })
}
