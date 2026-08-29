import type { User } from './user'

export type StartupStage = 'Idea' | 'MVP' | 'Early Traction' | 'Growth' | 'Scaling'

export type StartupMembershipStatus = 'ACTIVE' | 'PENDING' | 'REJECTED'

export interface StartupTeamMember {
  id: string
  userId: string
  role: string
  isFounder: boolean
  status: StartupMembershipStatus
  roleId?: string
  reviewedAt?: string
}

export interface StartupJoinRequest {
  id: string
  startupId: string
  startupName: string
  applicant: User
  status: StartupMembershipStatus
  roleId?: string
  roleTitle?: string
  message?: string
  createdAt: string
  reviewedAt?: string
}

export interface UpdateStartupInput {
  name?: string
  logoUrl?: string
  tagline?: string
  sector?: string
  problem?: string
  solution?: string
  stage?: StartupStage
  traction?: string
  isRaising?: boolean
  needs?: string[]
}

export interface StartupUpdate {
  id: string
  content: string
  createdAt: string
}

export interface StartupRole {
  id: string
  title: string
  type: 'Job' | 'Internship' | 'Founding Role'
  location: string
  remote: boolean
}

export interface Startup {
  id: string
  name: string
  logoUrl: string
  tagline: string
  sector: string
  problem: string
  solution: string
  stage: StartupStage
  traction: string
  needs: string[]
  /** Embedded (mock era). The real backend exposes these via separate endpoints:
   *  getStartupMembers/getStartupUpdates/getStartupRoles. */
  team?: StartupTeamMember[]
  updates?: StartupUpdate[]
  openRoles?: StartupRole[]
  ideaId?: string
  chapterId?: string
  followerIds?: string[]
  isFollowing?: boolean
  isRaising: boolean
  createdAt: string
}
