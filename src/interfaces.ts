import { QueryResult } from 'pg'

export interface IDeveloperRequest {
  name: string
  email: string
}

export interface IDeveloperInfoRequest {
  developerSince: string
  preferredOS: string
}

export interface IProjectRequest {
  name: string
  description: string
  estimatedTime: string
  repository: string
  startDate: string
  endDate: string | null
  developerId: number
}

export interface IProjectTechnologyRequest {
  addedIn: Date
  projectId: number
  technologyId: number
}

export interface ITechnology {
  id: number
  name: string
}

export interface IDeveloper extends IDeveloperRequest {
  id: number
  developerInfosId: number
}

export interface IDeveloperInfo extends IDeveloperInfoRequest {
  id: number
}

export interface IProject extends IProjectRequest {
  id: number
}

export interface IProjectTechnology extends IProjectTechnologyRequest {
  id: number
}

export type DeveloperRequiredKeys = 'name' | 'email'
export type DeveloperInfoRequiredKeys = 'developerSince' | 'preferredOS'
export type TechnologiesRequiredKeys = 'name'
export type ProjectTechnologiesRequiredValues =
  | 'JavaScript'
  | 'Python'
  | 'React'
  | 'Express.js'
  | 'HTML'
  | 'CSS'
  | 'Django'
  | 'PostgreSQL'
  | 'MongoDB'
export type ProjectRequiredKeys =
  | 'name'
  | 'description'
  | 'estimatedTime'
  | 'repository'
  | 'startDate'
  | 'endDate'
  | 'developerId'
export type DeveloperResult = QueryResult<IDeveloper>
export type DeveloperInfoResult = QueryResult<IDeveloperInfo>
export type ProjectsResult = QueryResult<IProject>
export type TechnologyResult = QueryResult<ITechnology>
export type ProjectTechnologyResult = QueryResult<IProjectTechnology>
