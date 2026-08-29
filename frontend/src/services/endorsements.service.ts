import { apiClient } from '@/lib/api-client'

export interface EndorsementToggleResult {
  endorsed: boolean
  count: number
}

export async function toggleEndorsement(userId: string, skill: string): Promise<EndorsementToggleResult> {
  return apiClient.post<EndorsementToggleResult>(`/users/${userId}/endorsements/${encodeURIComponent(skill)}`)
}
