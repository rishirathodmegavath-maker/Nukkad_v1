import { apiClient } from '@/lib/api-client'
import type { Recommendation } from '@/types'

interface RecommendationDto {
  id: string
  authorUserId: string
  authorName: string
  authorAvatarUrl: string | null
  authorHeadline: string | null
  relationship: string | null
  body: string
  status: string
  createdAt: string
  respondedAt: string | null
}

function mapRecommendation(dto: RecommendationDto): Recommendation {
  return {
    id: dto.id,
    authorUserId: dto.authorUserId,
    authorName: dto.authorName,
    authorAvatarUrl: dto.authorAvatarUrl ?? undefined,
    authorHeadline: dto.authorHeadline ?? undefined,
    relationship: dto.relationship ?? undefined,
    body: dto.body,
    status: dto.status as Recommendation['status'],
    createdAt: dto.createdAt,
    respondedAt: dto.respondedAt ?? undefined,
  }
}

export interface WriteRecommendationInput {
  relationship?: string
  body: string
}

export async function writeRecommendation(subjectId: string, input: WriteRecommendationInput): Promise<Recommendation> {
  return mapRecommendation(await apiClient.post<RecommendationDto>(`/users/${subjectId}/recommendations`, input))
}

export async function listPendingRecommendations(): Promise<Recommendation[]> {
  const dtos = await apiClient.get<RecommendationDto[]>('/users/me/recommendations/pending')
  return dtos.map(mapRecommendation)
}

export async function approveRecommendation(id: string): Promise<Recommendation> {
  return mapRecommendation(await apiClient.post<RecommendationDto>(`/users/me/recommendations/${id}/approve`))
}

export async function rejectRecommendation(id: string): Promise<Recommendation> {
  return mapRecommendation(await apiClient.post<RecommendationDto>(`/users/me/recommendations/${id}/reject`))
}

export async function deleteAuthoredRecommendation(id: string): Promise<void> {
  await apiClient.delete(`/users/me/recommendations/authored/${id}`)
}
