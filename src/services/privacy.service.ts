import { apiClient } from '@/lib/api-client'
import type { ProfileSection, SectionVisibility } from '@/types'

export type PrivacySettings = Record<ProfileSection, SectionVisibility>

export async function getPrivacySettings(): Promise<PrivacySettings> {
  return apiClient.get<PrivacySettings>('/users/me/privacy')
}

export async function updatePrivacySettings(updates: Partial<PrivacySettings>): Promise<PrivacySettings> {
  return apiClient.patch<PrivacySettings>('/users/me/privacy', updates)
}
