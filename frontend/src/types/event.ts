export interface NukkadEvent {
  id: string
  title: string
  description: string
  chapterId?: string
  chapterName?: string
  organizerUserId: string
  startAt: string
  endAt: string
  location: string
  isOnline: boolean
  meetingUrl?: string
  coverImageUrl: string
  capacity?: number
  attendeeCount: number
  isAttending: boolean
  /** Server-computed: whether the viewer (admin, or this chapter's president) can edit/delete this event. */
  canManage: boolean
  createdAt: string
}
