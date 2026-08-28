import { apiClient } from '@/lib/api-client'
import type { AccountPrivacySettings } from '@/types'

export async function getAccountPrivacy(): Promise<AccountPrivacySettings> {
  return apiClient.get<AccountPrivacySettings>('/users/me/account-privacy')
}

export async function updateAccountPrivacy(updates: Partial<AccountPrivacySettings>): Promise<AccountPrivacySettings> {
  return apiClient.patch<AccountPrivacySettings>('/users/me/account-privacy', updates)
}
