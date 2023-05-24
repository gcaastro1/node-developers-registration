import { Request, Response } from 'express'
import format from 'pg-format'
import { client } from '../database'
import {
  IProjectTechnologyRequest,
  ProjectTechnologiesRequiredValues,
  TechnologyResult,
} from '../interfaces'

const create = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const projectRequest = { name: request.body.name }
    const projectId = Number(request.params.id)

    if (!projectRequest.name) {
      return response.status(400).json({
        message: 'At least one of those keys must be send.',
        keys: ['name'],
      })
    }

    const requiredValues: Array<ProjectTechnologiesRequiredValues> = [
      'JavaScript',
      'Python',
      'React',
      'Express.js',
      'HTML',
      'CSS',
      'Django',
      'PostgreSQL',
      'MongoDB',
    ]

    const validateName = requiredValues.some(
      (value: string) => value === projectRequest.name
    )

    if (!validateName) {
      const joinedValues: string = requiredValues.join(', ')
      return response.status(400).json({
        message: 'Technology not supported.',
        options: `[${joinedValues}]`,
      })
    }

    let queryString: string = `
      SELECT
        *
      FROM
        technologies t
      WHERE
        t.name = $1
    `

    const queryTechnologyResult: TechnologyResult = await client.query(
      queryString,
      [projectRequest.name]
    )

    const projectTechnologyData: IProjectTechnologyRequest = {
      addedIn: new Date(),
      projectId: projectId,
      technologyId: queryTechnologyResult.rows[0].id,
    }

    queryString = format(
      `
          INSERT INTO
            projects_technologies(%I)
          VALUES 
            (%L)
          RETURNING *;
        `,
      Object.keys(projectTechnologyData),
      Object.values(projectTechnologyData)
    )
    await client.query(queryString)

    return response.status(201).send()
  } catch (error: unknown) {
    if (error instanceof Error) {
      return response.status(404).json({ message: error.message })
    }
    return response.status(500).json({ message: error })
  }
}

const remove = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const name: string = request.params.name

  const requiredValues: Array<ProjectTechnologiesRequiredValues> = [
    'JavaScript',
    'Python',
    'React',
    'Express.js',
    'HTML',
    'CSS',
    'Django',
    'PostgreSQL',
    'MongoDB',
  ]

  const validateName = requiredValues.some((value: string) => value === name)

  if (!validateName) {
    const joinedValues: string = requiredValues.join(', ')
    return response.status(400).json({
      message: 'Technology not supported.',
      options: `[${joinedValues}]`,
    })
  }

  let queryString: string = `
    SELECT
      pt.id
    FROM
      projects p
    LEFT JOIN
      projects_technologies pt 
      ON pt."projectId" = p.id
    LEFT JOIN
      technologies t
      ON t.id = pt."technologyId"
    WHERE
      t.name = $1;
  `

  let queryConfig = {
    text: queryString,
    values: [name],
  }

  const projectTechnologiesId = await client.query(queryConfig)

  if(!projectTechnologiesId.rowCount){
    return response.status(400).json({
      message: `Technology '${name}' not found on this Project.`,
    })
  }

  queryString = `
    DELETE FROM
      projects_technologies
    WHERE
      id = $1
  `

  queryConfig = {
    text: queryString,
    values: [projectTechnologiesId.rows[0].id],
  }

  await client.query(queryConfig)

  return response.status(204).send()
}

export default { create, remove }
