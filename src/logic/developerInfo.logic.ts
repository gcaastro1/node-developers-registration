import { Request, Response } from 'express'
import { QueryConfig } from 'pg'
import format from 'pg-format'
import { client } from '../database'
import {
  DeveloperInfoRequiredKeys,
  DeveloperInfoResult,
  IDeveloperInfoRequest,
} from '../interfaces'

const validateData = (payload: any) => {
  const keys: Array<string> = Object.keys(payload)
  const requiredKeys: Array<DeveloperInfoRequiredKeys> = [
    'developerSince',
    'preferredOS',
  ]

  console.log(payload)

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key)
  })

  if (!containsAllRequired) {
    const joinedKeys: string = requiredKeys.join(', ')
    throw new Error(`Required keys are: ${joinedKeys}`)
  }

  const body: IDeveloperInfoRequest = {
    developerSince: payload.developerSince,
    preferredOS: payload.preferredOS,
  }

  return body
}

const create = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerInfoRequest = request.body
    const developerInfoData = { ...developerInfoRequest }
    const id: number = Number(request.params.id)

    const validatedData: IDeveloperInfoRequest = validateData(developerInfoData)

    let queryString: string = format(
      `
          INSERT INTO
            developer_infos(%I)
          VALUES 
            (%L)
          RETURNING *;
        `,
      Object.keys(validatedData),
      Object.values(validatedData)
    )
    const queryResult: DeveloperInfoResult = await client.query(queryString)

    queryString = `
      UPDATE
        developers
      SET
        "developerInfosId" = $1
      WHERE
        id = $2
      RETURNING *;
    `

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryResult.rows[0].id, id],
    }

    await client.query(queryConfig)

    return response.status(201).json(queryResult.rows[0])
  } catch (error: unknown) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message })
    }
    return response.status(500).json({ message: error })
  }
}

const update = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const infoId = request.DeveloperData.developerInfosId
    const developerInfoRequest = request.body

    if (
      !developerInfoRequest.developerSince &&
      !developerInfoRequest.preferredOS
    ) {
      return response.status(400).json({
        message: 'At least one of those keys must be send.',
        keys: ['developerSince', 'preferredOS'],
      })
    }

    let queryString: string = `
    SELECT
      *
    FROM
      developer_infos
    WHERE
      id = $1
  `
    let selectConfig: QueryConfig = {
      text: queryString,
      values: [infoId],
    }

    const selectQueryResult: DeveloperInfoResult = await client.query(
      selectConfig
    )

    const updateBody = { ...selectQueryResult.rows[0], ...developerInfoRequest }

    const validatedData = validateData(updateBody)

    queryString = format(
      `
        UPDATE
          developer_infos
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
      values: [infoId],
    }

    const queryResult: DeveloperInfoResult = await client.query(queryConfig)

    return response.json(queryResult.rows[0])
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message })
    }
    return response.status(500).json({ message: error })
  }
}

export default { create, update }
