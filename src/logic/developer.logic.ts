import { Request, Response } from 'express'
import { QueryConfig } from 'pg'
import format from 'pg-format'
import { client } from '../database'
import {
  DeveloperRequiredKeys,
  DeveloperResult,
  IDeveloper,
  IDeveloperRequest,
} from '../interfaces'

const validateData = (payload: any) => {
  const keys: Array<string> = Object.keys(payload)
  const requiredKeys: Array<DeveloperRequiredKeys> = ['name', 'email']

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key)
  })

  if (!containsAllRequired) {
    const joinedKeys: string = requiredKeys.join(', ')
    throw new Error(`Required keys are: ${joinedKeys}`)
  }

  const body: IDeveloperRequest = {
    name: payload.name,
    email: payload.email,
  }

  return body
}

const create = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerRequest = request.body
    const developerData = { ...developerRequest }

    const validatedData: IDeveloperRequest = validateData(developerData)

    const queryString: string = format(
      `
          INSERT INTO
            developers(%I)
          VALUES 
            (%L)
          RETURNING *;
        `,
      Object.keys(validatedData),
      Object.values(validatedData)
    )
    const queryResult: DeveloperResult = await client.query(queryString)
    const newDeveloper: IDeveloper = queryResult.rows[0]

    return response.status(201).json(newDeveloper)
  } catch (error: unknown) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message })
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
      d.id "developerID", d.name "developerName", d.email "developerEmail", 
      di.id "developerInfoID", di."developerSince" "developerInfoDeveloperSince", di."preferredOS" "developerInfoPreferredOS"
    FROM
      developers d
    LEFT JOIN
      developer_infos di 
      ON di.id = d."developerInfosId"
  `
  const queryResult: DeveloperResult = await client.query(queryString)

  return response.status(200).json(queryResult.rows)
}

const readById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = Number(request.params.id)

  const queryString: string = `
    SELECT
      d.id "developerID", d.name "developerName", d.email "developerEmail", 
      di.id "developerInfoID", di."developerSince" "developerInfoDeveloperSince", di."preferredOS" "developerInfoPreferredOS"
    FROM
      developers d
    LEFT JOIN
      developer_infos di 
      ON di.id = d."developerInfosId"
    WHERE
      d.id = $1;
  `
  const queryResult: DeveloperResult = await client.query(queryString, [id])

  return response.status(200).json(queryResult.rows[0])
}

const readByIdWithProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = Number(request.params.id)

  const queryString: string = `
    SELECT
      d.id "developerID", d.name "developerName", d.email "developerEmail", 
      di.id "developerInfoID", di."developerSince" "developerInfoDeveloperSince", di."preferredOS" "developerInfoPreferredOS",
      p.id "projectID", p.name "projectName", p.description "projectDescription", 
      p."estimatedTime" "projectEstimatedTime", p."startDate" "projectStartDate",
      p."endDate" "projectEndDate", p."developerId" "projectDeveloperID",
      t.id "technologyID", t.name "technologyName"     
    FROM
      developers d
    LEFT JOIN
      developer_infos di 
      ON di.id = d."developerInfosId"
    LEFT JOIN
      projects p
      ON p."developerId" = d.id
    LEFT JOIN
      projects_technologies pt 
      ON pt."projectId" = p.id
    LEFT JOIN
      technologies t
      ON t.id = pt."technologyId"
    WHERE
      d.id = $1;
  `
  const queryResult: DeveloperResult = await client.query(queryString, [id])

  return response.status(200).json(queryResult.rows[0])
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
    const developerRequest = request.body

    if (!developerRequest.email && !developerRequest.name) {
      return response.status(400).json({
        message: 'At least one of those keys must be send.',
        keys: ['name', 'email'],
      })
    }

    const newData = { ...request.DeveloperData, ...developerRequest }

    const validatedData: IDeveloperRequest = validateData(newData)

    const queryString = format(
      `
          UPDATE
            developers
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

    const queryResult: DeveloperResult = await client.query(queryConfig)

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
  const developerInfoId: number = Number(request.DeveloperData.developerInfosId)

  let queryString: string = `
    DELETE FROM
      developer_infos
    WHERE
      id = $1
  `
  let queryConfig: QueryConfig = {
    text: queryString,
    values: [developerInfoId],
  }

  await client.query(queryConfig)

  queryString = `
    DELETE FROM
      developers
    WHERE
      id = $1
  `

  queryConfig = {
    text: queryString,
    values: [id],
  }

  await client.query(queryConfig)

  return response.status(204).send()
}

export default { create, read, readById, readByIdWithProject, update, remove }
