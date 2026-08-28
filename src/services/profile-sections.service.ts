import { apiClient } from '@/lib/api-client'
import type { Achievement, Certification, Education, Experience, ProjectType, Publication, UserProject } from '@/types'

interface ExperienceDto {
  id: string
  company: string
  role: string
  employmentType: string | null
  location: string | null
  startDate: string
  endDate: string | null
  isCurrent: boolean
  description: string | null
  companyUrl: string | null
  sortOrder: number
}

interface EducationDto {
  id: string
  institution: string
  degree: string | null
  fieldOfStudy: string | null
  startYear: number | null
  endYear: number | null
  grade: string | null
  description: string | null
  sortOrder: number
}

interface AchievementDto {
  id: string
  title: string
  organization: string | null
  achievedOn: string | null
  description: string | null
  credentialUrl: string | null
  sortOrder: number
}

interface CertificationDto {
  id: string
  title: string
  issuingOrg: string | null
  issueDate: string | null
  expiryDate: string | null
  credentialId: string | null
  credentialUrl: string | null
  sortOrder: number
}

interface ProjectDto {
  id: string
  title: string
  description: string | null
  technologies: string[]
  imageUrl: string | null
  githubUrl: string | null
  liveUrl: string | null
  startDate: string | null
  endDate: string | null
  projectType: string
  sortOrder: number
}

interface PublicationDto {
  id: string
  title: string
  publisher: string | null
  publishDate: string | null
  description: string | null
  url: string | null
  sortOrder: number
}

function mapExperience(dto: ExperienceDto): Experience {
  return {
    id: dto.id,
    company: dto.company,
    role: dto.role,
    employmentType: dto.employmentType ?? undefined,
    location: dto.location ?? undefined,
    startDate: dto.startDate,
    endDate: dto.endDate ?? undefined,
    isCurrent: dto.isCurrent,
    description: dto.description ?? undefined,
    companyUrl: dto.companyUrl ?? undefined,
    sortOrder: dto.sortOrder,
  }
}

function mapEducation(dto: EducationDto): Education {
  return {
    id: dto.id,
    institution: dto.institution,
    degree: dto.degree ?? undefined,
    fieldOfStudy: dto.fieldOfStudy ?? undefined,
    startYear: dto.startYear ?? undefined,
    endYear: dto.endYear ?? undefined,
    grade: dto.grade ?? undefined,
    description: dto.description ?? undefined,
    sortOrder: dto.sortOrder,
  }
}

function mapAchievement(dto: AchievementDto): Achievement {
  return {
    id: dto.id,
    title: dto.title,
    organization: dto.organization ?? undefined,
    achievedOn: dto.achievedOn ?? undefined,
    description: dto.description ?? undefined,
    credentialUrl: dto.credentialUrl ?? undefined,
    sortOrder: dto.sortOrder,
  }
}

function mapCertification(dto: CertificationDto): Certification {
  return {
    id: dto.id,
    title: dto.title,
    issuingOrg: dto.issuingOrg ?? undefined,
    issueDate: dto.issueDate ?? undefined,
    expiryDate: dto.expiryDate ?? undefined,
    credentialId: dto.credentialId ?? undefined,
    credentialUrl: dto.credentialUrl ?? undefined,
    sortOrder: dto.sortOrder,
  }
}

function mapPublication(dto: PublicationDto): Publication {
  return {
    id: dto.id,
    title: dto.title,
    publisher: dto.publisher ?? undefined,
    publishDate: dto.publishDate ?? undefined,
    description: dto.description ?? undefined,
    url: dto.url ?? undefined,
    sortOrder: dto.sortOrder,
  }
}

function mapProject(dto: ProjectDto): UserProject {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? '',
    technologies: dto.technologies,
    imageUrl: dto.imageUrl ?? undefined,
    githubUrl: dto.githubUrl ?? undefined,
    liveUrl: dto.liveUrl ?? undefined,
    startDate: dto.startDate ?? undefined,
    endDate: dto.endDate ?? undefined,
    projectType: dto.projectType as ProjectType,
    sortOrder: dto.sortOrder,
  }
}

export interface ExperienceInput {
  company: string
  role: string
  employmentType?: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description?: string
  companyUrl?: string
}

export async function addExperience(input: ExperienceInput): Promise<Experience> {
  return mapExperience(await apiClient.post<ExperienceDto>('/users/me/experiences', input))
}

export async function updateExperience(id: string, input: ExperienceInput): Promise<Experience> {
  return mapExperience(await apiClient.patch<ExperienceDto>(`/users/me/experiences/${id}`, input))
}

export async function deleteExperience(id: string): Promise<void> {
  await apiClient.delete(`/users/me/experiences/${id}`)
}

export interface EducationInput {
  institution: string
  degree?: string
  fieldOfStudy?: string
  startYear?: number
  endYear?: number
  grade?: string
  description?: string
}

export async function addEducation(input: EducationInput): Promise<Education> {
  return mapEducation(await apiClient.post<EducationDto>('/users/me/education', input))
}

export async function updateEducation(id: string, input: EducationInput): Promise<Education> {
  return mapEducation(await apiClient.patch<EducationDto>(`/users/me/education/${id}`, input))
}

export async function deleteEducation(id: string): Promise<void> {
  await apiClient.delete(`/users/me/education/${id}`)
}

export interface AchievementInput {
  title: string
  organization?: string
  achievedOn?: string
  description?: string
  credentialUrl?: string
}

export async function addAchievement(input: AchievementInput): Promise<Achievement> {
  return mapAchievement(await apiClient.post<AchievementDto>('/users/me/achievements', input))
}

export async function updateAchievement(id: string, input: AchievementInput): Promise<Achievement> {
  return mapAchievement(await apiClient.patch<AchievementDto>(`/users/me/achievements/${id}`, input))
}

export async function deleteAchievement(id: string): Promise<void> {
  await apiClient.delete(`/users/me/achievements/${id}`)
}

export interface CertificationInput {
  title: string
  issuingOrg?: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
}

export async function addCertification(input: CertificationInput): Promise<Certification> {
  return mapCertification(await apiClient.post<CertificationDto>('/users/me/certifications', input))
}

export async function updateCertification(id: string, input: CertificationInput): Promise<Certification> {
  return mapCertification(await apiClient.patch<CertificationDto>(`/users/me/certifications/${id}`, input))
}

export async function deleteCertification(id: string): Promise<void> {
  await apiClient.delete(`/users/me/certifications/${id}`)
}

export interface PublicationInput {
  title: string
  publisher?: string
  publishDate?: string
  description?: string
  url?: string
}

export async function addPublication(input: PublicationInput): Promise<Publication> {
  return mapPublication(await apiClient.post<PublicationDto>('/users/me/publications', input))
}

export async function updatePublication(id: string, input: PublicationInput): Promise<Publication> {
  return mapPublication(await apiClient.patch<PublicationDto>(`/users/me/publications/${id}`, input))
}

export async function deletePublication(id: string): Promise<void> {
  await apiClient.delete(`/users/me/publications/${id}`)
}

export interface ProjectInput {
  title: string
  description?: string
  technologies?: string[]
  imageUrl?: string
  githubUrl?: string
  liveUrl?: string
  startDate?: string
  endDate?: string
  projectType?: ProjectType
}

export async function addProject(input: ProjectInput): Promise<UserProject> {
  return mapProject(await apiClient.post<ProjectDto>('/users/me/projects', input))
}

export async function updateProject(id: string, input: ProjectInput): Promise<UserProject> {
  return mapProject(await apiClient.patch<ProjectDto>(`/users/me/projects/${id}`, input))
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/users/me/projects/${id}`)
}
