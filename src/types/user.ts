export type LookingFor =
  | 'Co-founder'
  | 'Team to join'
  | 'Mentorship'
  | 'Investment'
  | 'Job'
  | 'Internship'
  | 'Founding Role'
  | 'Collaborators'

export type OpenTo =
  | 'Collaborating'
  | 'Building ideas'
  | 'Startup projects'
  | 'Technical projects'
  | 'Research'
  | 'Speaking'
  | 'Mentorship'

export type SocialPlatform =
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'twitter'
  | 'kaggle'
  | 'leetcode'
  | 'behance'
  | 'dribbble'
  | 'medium'
  | 'instagram'
  | 'youtube'
  | 'stackoverflow'
  | 'devto'
  | 'producthunt'
  | 'huggingface'

export type Availability = 'Full-time' | 'Part-time' | 'Weekends' | 'Not available'

export type ConnectionStatus = 'NONE' | 'PENDING_OUTGOING' | 'PENDING_INCOMING' | 'CONNECTED'

export type ProjectType = 'PERSONAL' | 'ACADEMIC' | 'OPEN_SOURCE' | 'STARTUP'

export interface UserProject {
  id: string
  title: string
  description: string
  technologies: string[]
  imageUrl?: string
  githubUrl?: string
  liveUrl?: string
  startDate?: string
  endDate?: string
  projectType: ProjectType
  sortOrder: number
}

export interface Experience {
  id: string
  company: string
  role: string
  employmentType?: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description?: string
  companyUrl?: string
  sortOrder: number
}

export interface Education {
  id: string
  institution: string
  degree?: string
  fieldOfStudy?: string
  startYear?: number
  endYear?: number
  grade?: string
  description?: string
  sortOrder: number
}

export interface Achievement {
  id: string
  title: string
  organization?: string
  achievedOn?: string
  description?: string
  credentialUrl?: string
  sortOrder: number
}

export interface Certification {
  id: string
  title: string
  issuingOrg?: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  sortOrder: number
}

export interface Publication {
  id: string
  title: string
  publisher?: string
  publishDate?: string
  description?: string
  url?: string
  sortOrder: number
}

export interface EndorsementSummary {
  skill: string
  count: number
  endorsedByViewer: boolean
}

export type ProfileSection =
  | 'EXPERIENCE'
  | 'EDUCATION'
  | 'ACHIEVEMENTS'
  | 'PROJECTS'
  | 'CERTIFICATIONS'
  | 'PUBLICATIONS'
  | 'SOCIAL_LINKS'
  | 'RECOMMENDATIONS'

export type SectionVisibility = 'PUBLIC' | 'CONNECTIONS' | 'PRIVATE'

export type ProfileVisibility = 'EVERYONE' | 'CONNECTIONS'
export type MessagePermission = 'EVERYONE' | 'CONNECTIONS'
export type ConnectPermission = 'EVERYONE' | 'MUTUAL_CONNECTIONS' | 'NOBODY'

export interface AccountPrivacySettings {
  profileVisibility: ProfileVisibility
  messagePermission: MessagePermission
  connectPermission: ConnectPermission
}

export type ThemeModePreference = 'LIGHT' | 'DARK' | 'SYSTEM'
export type ThemePresetId =
  | 'NUKKAD_INDIGO'
  | 'OCEAN_BLUE'
  | 'TEAL'
  | 'EMERALD'
  | 'VIOLET'
  | 'PURPLE'
  | 'ROSE'
  | 'AMBER'
  | 'ORANGE'
  | 'RED'
  | 'PINK'
  | 'CYAN'
  | 'SLATE'
  | 'NEUTRAL'
  | 'CUSTOM'

export interface AppearanceSettings {
  themeMode: ThemeModePreference
  themePreset: ThemePresetId
  customPrimaryColor: string | null
  sidebarColor: string | null
  pageBgColor: string | null
  cardBgColor: string | null
  headerBgColor: string | null
  borderColor: string | null
  secondarySurfaceColor: string | null
}

export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Recommendation {
  id: string
  authorUserId: string
  authorName: string
  authorAvatarUrl?: string
  authorHeadline?: string
  relationship?: string
  body: string
  status: RecommendationStatus
  createdAt: string
  respondedAt?: string
}

export interface User {
  id: string
  name: string
  avatarUrl: string
  coverUrl?: string
  headline: string
  role: string
  collegeOrCompany: string
  location: string
  experienceYears: number
  skills: string[]
  lookingFor: LookingFor[]
  openTo?: OpenTo[]
  socialLinks?: Partial<Record<SocialPlatform, string>>
  goals: string
  bio: string
  availability: Availability
  projects: UserProject[]
  experiences?: Experience[]
  education?: Education[]
  achievements?: Achievement[]
  certifications?: Certification[]
  publications?: Publication[]
  profileCompleteness?: number
  endorsementSummary?: EndorsementSummary[]
  recommendations?: Recommendation[]
  startupIds: string[]
  chapterId?: string
  connectionsCount: number
  connectionStatus?: ConnectionStatus
  isFollowing?: boolean
  isOnline?: boolean
  createdAt: string
  roles: string[]
  googleLinked: boolean
}
