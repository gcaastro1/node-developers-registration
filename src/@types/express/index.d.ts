import * as express from 'express'
import { IDeveloper, IProject, IProjectRequest } from '../../interfaces'

declare global {
  namespace Express {
    interface Request {
      DeveloperData: IDeveloper
      ProjectData: IProject
    }
  }
}
