import { NextFunction, Request, Response } from 'express'
import { QueryConfig } from 'pg'
import { client } from './database'
import {
  DeveloperResult,
  ProjectsResult,
} from './interfaces'

export const checkIfEmailExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const email: string = request.body.email || null

  if (!email) {
    return response.status(400).json({
      message: 'Email is required.',
    })
  }

  const queryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      email = $1
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [email],
  }

  const queryResult: DeveloperResult = await client.query(queryConfig)

  if (queryResult.rowCount >= 1) {
    return response.status(409).json({
      message: 'Email already exists.',
    })
  }

  return next()
}
export const checkIfDeveloperExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: string = request.params.id

  const queryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      id = $1
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  }

  const queryResult: DeveloperResult = await client.query(queryConfig)

  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: 'Developer not found.',
    })
  }

  request.DeveloperData = {
    ...queryResult.rows[0],
  }

  return next()
}

export const checkIfProjectExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: string = request.params.id

  const queryString: string = `
    SELECT
      *
    FROM
      projects
    WHERE
      id = $1
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  }

  const queryResult: ProjectsResult = await client.query(queryConfig)

  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: 'Project not found.',
    })
  }

  request.ProjectData = {
    ...queryResult.rows[0],
  }

  return next()
}