import { Request, Response } from 'express'
import { QueryConfig } from 'pg'
import format from 'pg-format'
import { client } from '../database'
import {
  IProjectRequest,
  ProjectRequiredKeys,
  ProjectsResult,
} from '../interfaces'

const validateData = async (payload: any) => {
  if (!payload.endDate) {
    payload = { ...payload, endDate: null }
  }

  const keys: Array<string> = Object.keys(payload)
  const requiredKeys: Array<ProjectRequiredKeys> = [
    'name',
    'description',
    'estimatedTime',
    'repository',
    'startDate',
    'endDate',
    'developerId',
  ]

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key)
  })

  if (!containsAllRequired) {
    const joinedKeys: string = requiredKeys.join(', ')
    throw new Error(`Required keys are: [${joinedKeys}]`)
  }

  const developerId = payload.developerId

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
    values: [developerId],
  }

  const queryResult: ProjectsResult = await client.query(queryConfig)

  if (!queryResult.rowCount) {
    console.log(queryResult.rowCount)
    throw new Error(`Developer not found.`)
  }

  const projectData: IProjectRequest = {
    name: payload.name,
    description: payload.description,
    estimatedTime: payload.estimatedTime,
    repository: payload.repository,
    startDate: payload.startDate,
    developerId: payload.developerId,
    endDate: payload.endDate,
  }

  return projectData
}

const create = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const projectRequest = request.body

    const validatedData = await validateData(projectRequest)

    let queryString: string = format(
      `
          INSERT INTO
            projects(%I)
          VALUES 
            (%L)
          RETURNING *;
        `,
      Object.keys(validatedData),
      Object.values(validatedData)
    )
    const queryResult: ProjectsResult = await client.query(queryString)

    return response.status(201).json(queryResult.rows[0])
  } catch (error: unknown) {
    if (error instanceof Error) {
      return response.status(404).json({ message: error.message })
    }
    return response.status(500).json({ message: error })
  }
}

const read = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
    SELECT
      p.id "projectID", p.name "projectName", p.description "projectDescription", 
      p."estimatedTime" "projectEstimatedTime", p."startDate" "projectStartDate",
      p."endDate" "projectEndDate", p."developerId" "projectDeveloperID",
      t.id "technologyID", t.name "technologyName"
    FROM
      projects p
    LEFT JOIN
      projects_technologies pt 
      ON pt."projectId" = p.id
    LEFT JOIN
      technologies t
      ON t.id = pt."technologyId"
  `
  const queryResult: ProjectsResult = await client.query(queryString)

  return response.status(200).json(queryResult.rows)
}

const readById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = Number(request.params.id)

  const queryString: string = `
    SELECT
      p.id "projectID", p.name "projectName", p.description "projectDescription", 
      p."estimatedTime" "projectEstimatedTime", p."startDate" "projectStartDate",
      p."endDate" "projectEndDate", p."developerId" "projectDeveloperID",
      t.id "technologyID", t.name "technologyName"
    FROM
      projects p
    LEFT JOIN
      projects_technologies pt 
      ON pt."projectId" = p.id
    LEFT JOIN
      technologies t
      ON t.id = pt."technologyId"
    WHERE
      p.id = $1
  `
  const queryResult: ProjectsResult = await client.query(queryString, [id])

  return response.status(200).json(queryResult.rows)
}

const update = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    if (request.body.id) {
      return response.status(400).json({
        message: 'Id is not editable.',
      })
    }

    const id: number = Number(request.params.id)
    const projectRequest = request.body

    /* if (!developerRequest.email && !developerRequest.name) {
      return response.status(400).json({
        message: 'At least one of those keys must be send.',
        keys: ['name', 'email'],
      })
    } */

    const newData = { ...request.ProjectData, ...projectRequest }

    const validatedData = await validateData(newData)

    const queryString = format(
      `
          UPDATE
            projects
          SET(%I) = ROW(%L)
          WHERE
            id = $1
          RETURNING *;
        `,
      Object.keys(validatedData),
      Object.values(validatedData)
    )

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    }

    const queryResult: ProjectsResult = await client.query(queryConfig)

    return response.json(queryResult.rows[0])
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message })
    }
    return response.status(500).json({ message: error })
  }
}

const remove = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = Number(request.params.id)
  //const developerInfoId: number = Number(request.DeveloperData.developerInfosId)

  /* let queryString: string = `
    DELETE FROM
      developer_infos
    WHERE
      id = $1
  `
  let queryConfig: QueryConfig = {
    text: queryString,
    values: [developerInfoId],
  }

  await client.query(queryConfig) */

  let queryString = `
    DELETE FROM
      projects
    WHERE
      id = $1
  `

  let queryConfig = {
    text: queryString,
    values: [id],
  }

  await client.query(queryConfig)

  return response.status(204).send()
}

export default { create, read, readById, update, remove }
