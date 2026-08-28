import { apiClient, getPage, uploadFile } from '@/lib/api-client'
import type { Resource, ResourceType } from '@/types'

export interface ResourceFilters {
  query?: string
  type?: ResourceType
  chapterId?: string
}

export interface CreateResourceInput {
  title: string
  description?: string
  type: ResourceType
  url?: string
  file?: File
  chapterId?: string
  tags: string[]
}

export interface UpdateResourceInput {
  title?: string
  description?: string
  type?: ResourceType
  url?: string
  /** Pass '' to unassign from any chapter; omit to leave unchanged. */
  chapterId?: string
  tags?: string[]
}

interface ResourceDto {
  id: string
  title: string
  description: string | null
  type: string
  url: string
  uploaderUserId: string
  chapterId: string | null
  chapterName: string | null
  tags: string[]
  isSaved: boolean
  canManage: boolean
  createdAt: string
  updatedAt: string
}

function mapResource(dto: ResourceDto): Resource {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? '',
    type: dto.type as ResourceType,
    url: dto.url,
    uploaderUserId: dto.uploaderUserId,
    chapterId: dto.chapterId ?? undefined,
    chapterName: dto.chapterName ?? undefined,
    tags: dto.tags,
    isSaved: dto.isSaved,
    canManage: dto.canManage,
    createdAt: dto.createdAt,
  }
}

export async function listResources(filters: ResourceFilters = {}): Promise<Resource[]> {
  const dtos = await getPage<ResourceDto>('/resources', {
    q: filters.query,
    type: filters.type,
    chapterId: filters.chapterId,
  })
  return dtos.map(mapResource)
}

export async function getResource(id: string): Promise<Resource | undefined> {
  try {
    return mapResource(await apiClient.get<ResourceDto>(`/resources/${id}`))
  } catch {
    return undefined
  }
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  const dto = await uploadFile<ResourceDto>('/resources', input.file ?? null, 'file', {
    title: input.title,
    description: input.description,
    type: input.type,
    url: input.url,
    chapterId: input.chapterId,
    tags: input.tags.join(','),
  })
  return mapResource(dto)
}

export async function updateResource(id: string, input: UpdateResourceInput): Promise<Resource> {
  return mapResource(await apiClient.put<ResourceDto>(`/resources/${id}`, input))
}

export async function deleteResource(id: string): Promise<void> {
  await apiClient.delete(`/resources/${id}`)
}

export async function toggleSaveResource(id: string): Promise<{ saved: boolean }> {
  return apiClient.post<{ saved: boolean }>(`/resources/${id}/save`)
}
