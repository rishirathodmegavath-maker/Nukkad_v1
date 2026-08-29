import { apiClient, getPage, uploadFile } from '@/lib/api-client'
import type { AttachmentKind, Post, PostAttachment, PostComment, PostType } from '@/types'

interface AttachmentDto {
  id: string
  url: string
  kind: string
  fileName: string | null
}

export interface PostDto {
  id: string
  authorId: string
  type: string
  content: string
  relatedId: string | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
  isSaved: boolean
  hideLikeCount: boolean
  commentsDisabled: boolean
  createdAt: string
  attachments: AttachmentDto[]
}

/** Ref to an already-uploaded, not-yet-attached file — same shape the upload endpoint returns and create-post expects. */
export interface AttachmentRef {
  url: string
  kind: string
  fileName?: string
}

function mapAttachment(dto: AttachmentDto): PostAttachment {
  return { id: dto.id, url: dto.url, kind: dto.kind.toLowerCase() as AttachmentKind, fileName: dto.fileName ?? undefined }
}

export function mapPost(dto: PostDto): Post {
  return {
    id: dto.id,
    authorId: dto.authorId,
    type: dto.type as PostType,
    content: dto.content,
    relatedId: dto.relatedId ?? undefined,
    likesCount: dto.likesCount,
    commentsCount: dto.commentsCount,
    isLiked: dto.isLiked,
    isSaved: dto.isSaved,
    hideLikeCount: dto.hideLikeCount,
    commentsDisabled: dto.commentsDisabled,
    createdAt: dto.createdAt,
    attachments: dto.attachments.map(mapAttachment),
  }
}

export async function listFeed(authorId?: string): Promise<Post[]> {
  const dtos = await getPage<PostDto>('/feed', { authorId })
  return dtos.map(mapPost)
}

export async function uploadAttachment(file: File): Promise<AttachmentRef> {
  return uploadFile<AttachmentRef>('/feed/attachments', file)
}

export async function createPost(
  content: string,
  type: PostType = 'text',
  relatedId?: string,
  attachments: AttachmentRef[] = [],
): Promise<Post> {
  const dto = await apiClient.post<PostDto>('/feed', { content, type, relatedId, attachments })
  return mapPost(dto)
}

export async function toggleLike(id: string): Promise<Post> {
  const dto = await apiClient.post<PostDto>(`/feed/${id}/like`)
  return mapPost(dto)
}

export async function toggleSave(id: string): Promise<Post> {
  const dto = await apiClient.post<PostDto>(`/feed/${id}/save`)
  return mapPost(dto)
}

export async function getPost(id: string): Promise<Post> {
  const dto = await apiClient.get<PostDto>(`/feed/${id}`)
  return mapPost(dto)
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete<void>(`/feed/${id}`)
}

export async function updatePost(id: string, content: string): Promise<Post> {
  const dto = await apiClient.patch<PostDto>(`/feed/${id}`, { content })
  return mapPost(dto)
}

export async function toggleHideLikeCount(id: string): Promise<Post> {
  const dto = await apiClient.patch<PostDto>(`/feed/${id}/hide-like-count`)
  return mapPost(dto)
}

export async function toggleCommentsDisabled(id: string): Promise<Post> {
  const dto = await apiClient.patch<PostDto>(`/feed/${id}/comments-disabled`)
  return mapPost(dto)
}

interface CommentDto {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: string
}

function mapComment(dto: CommentDto): PostComment {
  return { id: dto.id, postId: dto.postId, authorId: dto.authorId, content: dto.content, createdAt: dto.createdAt }
}

export async function listComments(postId: string): Promise<PostComment[]> {
  const dtos = await getPage<CommentDto>(`/feed/${postId}/comments`)
  return dtos.map(mapComment)
}

export async function addComment(postId: string, content: string): Promise<PostComment> {
  const dto = await apiClient.post<CommentDto>(`/feed/${postId}/comments`, { content })
  return mapComment(dto)
}
