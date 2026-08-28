import { apiClient, getPage, uploadFile } from '@/lib/api-client'
import { mapUser, type UserDto } from '@/services/users.service'
import type {
  Startup,
  StartupJoinRequest,
  StartupMembershipStatus,
  StartupRole,
  StartupStage,
  StartupTeamMember,
  StartupUpdate,
  UpdateStartupInput,
} from '@/types'

export interface StartupFilters {
  query?: string
  sector?: string
  stage?: StartupStage
  isRaising?: boolean
  chapterId?: string
  memberId?: string
}

interface StartupDto {
  id: string
  name: string
  logoUrl: string | null
  tagline: string | null
  sector: string | null
  problem: string | null
  solution: string | null
  stage: string
  traction: string | null
  ideaId: string | null
  chapterId: string | null
  isRaising: boolean
  needs: string[]
  isFollowing: boolean
  createdAt: string
  updatedAt: string
}

function mapStartup(dto: StartupDto): Startup {
  return {
    id: dto.id,
    name: dto.name,
    logoUrl: dto.logoUrl ?? '',
    tagline: dto.tagline ?? '',
    sector: dto.sector ?? '',
    problem: dto.problem ?? '',
    solution: dto.solution ?? '',
    stage: dto.stage as StartupStage,
    traction: dto.traction ?? '',
    needs: dto.needs,
    ideaId: dto.ideaId ?? undefined,
    chapterId: dto.chapterId ?? undefined,
    isFollowing: dto.isFollowing,
    isRaising: dto.isRaising,
    createdAt: dto.createdAt,
  }
}

export async function listStartups(filters: StartupFilters = {}): Promise<Startup[]> {
  const dtos = await getPage<StartupDto>('/startups', {
    q: filters.query,
    sector: filters.sector,
    stage: filters.stage,
    isRaising: filters.isRaising,
    chapterId: filters.chapterId,
    memberId: filters.memberId,
  })
  return dtos.map(mapStartup)
}

export async function getStartup(id: string): Promise<Startup | undefined> {
  try {
    return mapStartup(await apiClient.get<StartupDto>(`/startups/${id}`))
  } catch {
    return undefined
  }
}

export async function updateStartup(id: string, input: UpdateStartupInput): Promise<Startup> {
  return mapStartup(await apiClient.put<StartupDto>(`/startups/${id}`, input))
}

export async function uploadStartupLogo(id: string, file: File): Promise<Startup> {
  return mapStartup(await uploadFile<StartupDto>(`/startups/${id}/logo`, file))
}

export async function removeStartupLogo(id: string): Promise<Startup> {
  return mapStartup(await apiClient.delete<StartupDto>(`/startups/${id}/logo`))
}

export async function toggleFollowStartup(id: string): Promise<Startup> {
  await apiClient.post(`/startups/${id}/follow`)
  const startup = await getStartup(id)
  if (!startup) throw new Error('Startup not found')
  return startup
}

interface StartupTeamMemberDto {
  id: string
  startupId: string
  userId: string
  role: string | null
  isFounder: boolean
  status: string
  roleId: string | null
  createdAt: string
  reviewedAt: string | null
}

function mapTeamMember(dto: StartupTeamMemberDto): StartupTeamMember {
  return {
    id: dto.id,
    userId: dto.userId,
    role: dto.role ?? (dto.isFounder ? 'Founder' : 'Member'),
    isFounder: dto.isFounder,
    status: dto.status as StartupMembershipStatus,
    roleId: dto.roleId ?? undefined,
    reviewedAt: dto.reviewedAt ?? undefined,
  }
}

export async function requestToJoinStartup(id: string, roleId?: string, message?: string): Promise<StartupTeamMember> {
  const dto = await apiClient.post<StartupTeamMemberDto>(`/startups/${id}/join`, {
    roleId: roleId ?? null,
    message: message?.trim() || null,
  })
  return mapTeamMember(dto)
}

export async function leaveStartup(id: string): Promise<void> {
  await apiClient.post(`/startups/${id}/leave`)
}

export async function getStartupMembers(startupId: string): Promise<StartupTeamMember[]> {
  const dtos = await apiClient.get<StartupTeamMemberDto[]>(`/startups/${startupId}/members`)
  return dtos.map(mapTeamMember)
}

export async function addStartupTeamMember(startupId: string, userId: string, roleId?: string): Promise<StartupTeamMember> {
  const dto = await apiClient.post<StartupTeamMemberDto>(`/startups/${startupId}/members`, { userId, roleId: roleId ?? null })
  return mapTeamMember(dto)
}

export async function removeStartupTeamMember(startupId: string, userId: string): Promise<void> {
  await apiClient.delete(`/startups/${startupId}/members/${userId}`)
}

export async function getMyStartupMembership(startupId: string): Promise<StartupTeamMember | undefined> {
  const dto = await apiClient.get<StartupTeamMemberDto | null>(`/startups/${startupId}/my-membership`)
  return dto ? mapTeamMember(dto) : undefined
}

interface StartupJoinRequestDto {
  id: string
  startupId: string
  startupName: string
  applicant: UserDto
  status: string
  roleId: string | null
  roleTitle: string | null
  message: string | null
  createdAt: string
  reviewedAt: string | null
}

function mapJoinRequest(dto: StartupJoinRequestDto): StartupJoinRequest {
  return {
    id: dto.id,
    startupId: dto.startupId,
    startupName: dto.startupName,
    applicant: mapUser(dto.applicant),
    status: dto.status as StartupMembershipStatus,
    roleId: dto.roleId ?? undefined,
    roleTitle: dto.roleTitle ?? undefined,
    message: dto.message ?? undefined,
    createdAt: dto.createdAt,
    reviewedAt: dto.reviewedAt ?? undefined,
  }
}

export async function getStartupJoinRequests(startupId: string): Promise<StartupJoinRequest[]> {
  const dtos = await apiClient.get<StartupJoinRequestDto[]>(`/startups/${startupId}/join-requests`)
  return dtos.map(mapJoinRequest)
}

export async function acceptStartupJoinRequest(memberId: string): Promise<StartupTeamMember> {
  return mapTeamMember(await apiClient.post<StartupTeamMemberDto>(`/startups/join-requests/${memberId}/accept`))
}

export async function rejectStartupJoinRequest(memberId: string): Promise<StartupTeamMember> {
  return mapTeamMember(await apiClient.post<StartupTeamMemberDto>(`/startups/join-requests/${memberId}/reject`))
}

interface StartupUpdateDto {
  id: string
  startupId: string
  content: string
  createdAt: string
}

export async function getStartupUpdates(startupId: string): Promise<StartupUpdate[]> {
  const dtos = await apiClient.get<StartupUpdateDto[]>(`/startups/${startupId}/updates`)
  return dtos.map((u) => ({ id: u.id, content: u.content, createdAt: u.createdAt }))
}

export async function postStartupUpdate(startupId: string, content: string): Promise<StartupUpdate> {
  const dto = await apiClient.post<StartupUpdateDto>(`/startups/${startupId}/updates`, { content })
  return { id: dto.id, content: dto.content, createdAt: dto.createdAt }
}

interface StartupRoleDto {
  id: string
  startupId: string
  title: string
  type: string
  location: string | null
  remote: boolean
  createdAt: string
}

export async function getStartupRoles(startupId: string): Promise<StartupRole[]> {
  const dtos = await apiClient.get<StartupRoleDto[]>(`/startups/${startupId}/roles`)
  return dtos.map((r) => ({ id: r.id, title: r.title, type: r.type as StartupRole['type'], location: r.location ?? '', remote: r.remote }))
}
