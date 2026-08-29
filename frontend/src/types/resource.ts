export type ResourceType = 'Document' | 'Link' | 'Video' | 'Note' | 'Template'

export interface Resource {
  id: string
  title: string
  description: string
  type: ResourceType
  url: string
  uploaderUserId: string
  chapterId?: string
  chapterName?: string
  tags: string[]
  isSaved: boolean
  /** Server-computed: whether the viewer (the uploader) can edit/delete this resource. */
  canManage: boolean
  createdAt: string
}
