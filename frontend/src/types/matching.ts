import type { User } from './user'
import type { Idea } from './idea'
import type { Opportunity } from './opportunity'

export interface PeopleRecommendation {
  user: User
  score: number
  mutualConnections: number
  commonSkills: string[]
  graphDistance?: number
  reasons: string[]
}

export interface CofounderMatch {
  user: User
  score: number
  mutualConnections: number
  reasons: string[]
}

export type MatchLabel = 'Strong match' | 'Good match' | 'Potential match'

export interface IdeaMatch {
  idea: Idea
  score: number
  matchLabel: MatchLabel
  reasons: string[]
}

export interface OpportunityMatch {
  opportunity: Opportunity
  score: number
  matchLabel: MatchLabel
  reasons: string[]
}
