import { z } from 'zod'
import { db } from './db.js'
import { createProducerScript, createScenePlan, stageTemplates } from './domain.js'

export const briefSchema = z.object({
  name: z.string().trim().min(1).max(80),
  age: z.string().trim().min(1).max(20),
  occasion: z.string().trim().min(1).max(120),
  world: z.string().trim().min(1).max(160),
  tone: z.string().trim().min(1).max(180),
  duration: z.string().trim().min(1).max(80),
})

export type ProjectDto = Awaited<ReturnType<typeof getProject>>

export async function createProject(input: unknown) {
  const brief = briefSchema.parse(input)
  const script = createProducerScript(brief)
  const scenes = createScenePlan(brief)

  const client = await db.connect()

  try {
    await client.query('begin')
    const projectResult = await client.query<{ id: string }>(
      `
        insert into projects (name, age, occasion, world, tone, duration, script)
        values ($1, $2, $3, $4, $5, $6, $7)
        returning id
      `,
      [brief.name, brief.age, brief.occasion, brief.world, brief.tone, brief.duration, script],
    )
    const projectId = projectResult.rows[0]?.id

    for (const [index, stage] of stageTemplates.entries()) {
      await client.query(
        `
          insert into project_stages (project_id, slug, title, detail, sort_order)
          values ($1, $2, $3, $4, $5)
        `,
        [projectId, stage.slug, stage.title, stage.detail, index],
      )
    }

    for (const [index, scene] of scenes.entries()) {
      await client.query(
        `
          insert into scenes (project_id, title, prompt, gradient, sort_order)
          values ($1, $2, $3, $4, $5)
        `,
        [projectId, scene.title, scene.prompt, scene.gradient, index],
      )
    }

    await client.query('commit')
    return getProject(projectId)
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function listProjects() {
  const result = await db.query(`
    select id, name, age, occasion, world, tone, duration, script, status, montage_status, montage_url, montage_note, created_at, updated_at
    from projects
    order by created_at desc
    limit 30
  `)

  return result.rows
}

export async function getProject(projectId: string) {
  const projectResult = await db.query(
    `
      select id, name, age, occasion, world, tone, duration, script, status, montage_status, montage_url, montage_note, created_at, updated_at
      from projects
      where id = $1
    `,
    [projectId],
  )
  const project = projectResult.rows[0]

  if (!project) return null

  const [stagesResult, scenesResult] = await Promise.all([
    db.query(
      `
        select slug, title, detail, progress, status
        from project_stages
        where project_id = $1
        order by sort_order asc
      `,
      [projectId],
    ),
    db.query(
      `
        select id, title, prompt, gradient, image_url, image_provider, image_status, sort_order
          , video_url, video_provider, video_status, video_prompt, video_job_id
        from scenes
        where project_id = $1
        order by sort_order asc
      `,
      [projectId],
    ),
  ])

  return {
    ...project,
    brief: {
      name: project.name,
      age: project.age,
      occasion: project.occasion,
      world: project.world,
      tone: project.tone,
      duration: project.duration,
    },
    stages: stagesResult.rows,
    scenes: scenesResult.rows,
  }
}

export async function listScenesForProject(projectId: string) {
  const result = await db.query<{
    id: string
    title: string
    prompt: string
    gradient: string
    image_url: string | null
    video_url: string | null
    video_status: string
    video_prompt: string | null
  }>(
    `
      select id, title, prompt, gradient, image_url, video_url, video_status, video_prompt
      from scenes
      where project_id = $1
      order by sort_order asc
    `,
    [projectId],
  )

  return result.rows
}

export async function updateSceneVideo(
  sceneId: string,
  videoUrl: string | null,
  videoProvider: string | null,
  videoStatus: string,
  videoPrompt: string | null,
  videoJobId: string | null,
) {
  await db.query(
    `
      update scenes
      set video_url = $2,
          video_provider = $3,
          video_status = $4,
          video_prompt = $5,
          video_job_id = $6
      where id = $1
    `,
    [sceneId, videoUrl, videoProvider, videoStatus, videoPrompt, videoJobId],
  )
}

export async function updateSceneImage(
  sceneId: string,
  imageUrl: string | null,
  imageProvider: string | null,
  imageStatus: string,
) {
  await db.query(
    `
      update scenes
      set image_url = $2, image_provider = $3, image_status = $4
      where id = $1
    `,
    [sceneId, imageUrl, imageProvider, imageStatus],
  )
}

export async function updateProjectStatus(projectId: string, status: string) {
  await db.query(
    `
      update projects
      set status = $2, updated_at = now()
      where id = $1
    `,
    [projectId, status],
  )
}

export async function resetProduction(projectId: string) {
  const client = await db.connect()

  try {
    await client.query('begin')
    await client.query(
      `
        update projects
        set status = 'queued',
            montage_status = 'pending',
            montage_url = null,
            montage_note = null,
            updated_at = now()
        where id = $1
      `,
      [projectId],
    )
    await client.query(
      `
        update project_stages
        set progress = 0, status = 'queued', updated_at = now()
        where project_id = $1
      `,
      [projectId],
    )
    await client.query(
      `
        update scenes
        set image_status = case when image_url is null then 'pending' else image_status end,
            video_status = case when video_url is null then 'pending' else video_status end
        where project_id = $1
      `,
      [projectId],
    )
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function prepareMontage(projectId: string) {
  const client = await db.connect()

  try {
    await client.query('begin')

    const scenesResult = await client.query<{
      total: string
      ready_images: string
      ready_videos: string
    }>(
      `
        select
          count(*)::text as total,
          count(*) filter (where image_url is not null and image_status = 'ready')::text as ready_images,
          count(*) filter (where video_url is not null and video_status = 'ready')::text as ready_videos
        from scenes
        where project_id = $1
      `,
      [projectId],
    )

    const totals = scenesResult.rows[0]
    const total = Number(totals?.total ?? 0)
    const readyImages = Number(totals?.ready_images ?? 0)
    const readyVideos = Number(totals?.ready_videos ?? 0)
    const status = readyVideos >= total && total > 0 ? 'ready' : readyImages > 0 ? 'prepared' : 'waiting_for_frames'
    const note =
      status === 'ready'
        ? 'Все видеосцены готовы. Можно собирать финальный MP4.'
        : status === 'prepared'
          ? 'Монтажный проект подготовлен: тайминг, порядок сцен, дикторский текст и подсказки готовы. Финальный MP4 ждёт image-to-video клипы.'
          : 'Сначала нужны ключевые кадры, затем можно готовить монтаж.'

    await client.query(
      `
        update projects
        set status = $2,
            montage_status = $3,
            montage_note = $4,
            updated_at = now()
        where id = $1
      `,
      [projectId, status === 'ready' ? 'assembled' : 'montage_prepared', status, note],
    )

    await client.query(
      `
        update project_stages
        set progress = $2,
            status = $3,
            updated_at = now()
        where project_id = $1 and slug = 'edit'
      `,
      [projectId, status === 'ready' ? 100 : readyImages > 0 ? 60 : 0, status === 'ready' ? 'done' : readyImages > 0 ? 'active' : 'queued'],
    )

    await client.query('commit')
    return getProject(projectId)
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function updateStage(projectId: string, slug: string, progress: number, status: string) {
  await db.query(
    `
      update project_stages
      set progress = $3, status = $4, updated_at = now()
      where project_id = $1 and slug = $2
    `,
    [projectId, slug, progress, status],
  )
}
