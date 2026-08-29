import { apiClient } from '@/lib/api-client'
import { mapUser, type UserDto } from '@/services/users.service'
import type { CofounderMatch, PeopleRecommendation } from '@/types'

interface RecommendedUserDto {
  user: UserDto
  score: number
  mutualConnections: number
  commonSkills: string[]
  graphDistance: number | null
  reasons: string[]
}

function mapPeopleRecommendation(dto: RecommendedUserDto): PeopleRecommendation {
  return {
    user: mapUser(dto.user),
    score: dto.score,
    mutualConnections: dto.mutualConnections,
    commonSkills: dto.commonSkills,
    graphDistance: dto.graphDistance ?? undefined,
    reasons: dto.reasons,
  }
}

export async function getPeopleRecommendations(limit = 10): Promise<PeopleRecommendation[]> {
  const dtos = await apiClient.get<RecommendedUserDto[]>(`/users/me/recommendations?limit=${limit}`)
  return dtos.map(mapPeopleRecommendation)
}

interface CofounderMatchDto {
  user: UserDto
  score: number
  mutualConnections: number
  reasons: string[]
}

function mapCofounderMatch(dto: CofounderMatchDto): CofounderMatch {
  return {
    user: mapUser(dto.user),
    score: dto.score,
    mutualConnections: dto.mutualConnections,
    reasons: dto.reasons,
  }
}

export async function getCofounderMatches(limit = 10): Promise<CofounderMatch[]> {
  const dtos = await apiClient.get<CofounderMatchDto[]>(`/users/me/matches?limit=${limit}`)
  return dtos.map(mapCofounderMatch)
}
