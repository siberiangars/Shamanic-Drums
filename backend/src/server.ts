import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ZodError } from 'zod'
import { config } from './config.js'
import { closeDb, db, migrate } from './db.js'
import { closeQueue, generationQueue } from './queue.js'
import { createProject, getProject, listProjects, prepareMontage, resetProduction } from './projects.js'
import { defaultBrief } from './domain.js'

type DrumLead = {
  serviceType: string
  name: string
  contact: string
  city: string
  format: string
  preferredDate: string
  diameter: string
  membrane: string
  rim: string
  tuning: string
  purpose: string
  message: string
}

const leadDefaults: DrumLead = {
  serviceType: 'drum',
  name: '',
  contact: '',
  city: '',
  format: '',
  preferredDate: '',
  diameter: '',
  membrane: '',
  rim: '',
  tuning: '',
  purpose: '',
  message: '',
}

const app = Fastify({
  logger: true,
})

await app.register(cors, {
  origin: true,
})

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'ValidationError',
      issues: error.issues,
    })
  }

  app.log.error(error)
  return reply.status(500).send({ error: 'InternalServerError' })
})

app.get('/health', async () => ({
  ok: true,
  service: 'multstudio-api',
}))

app.get('/api/integrations/status', async () => ({
  integrations: {
    anthropic: Boolean(config.anthropicApiKey),
    elevenlabs: Boolean(config.elevenlabsApiKey),
    suno: Boolean(config.sunoApiKey),
    kling: Boolean(config.klingApiKey),
    openai: Boolean(config.openaiApiKey),
    abacus: Boolean(config.abacusApiKey),
    imageProvider: config.imageProvider,
    imageProviderConfigured:
      config.imageProvider === 'abacus'
        ? Boolean(config.abacusApiKey)
        : config.imageProvider === 'openai'
          ? Boolean(config.openaiApiKey)
          : Boolean(config.genericImageProviderApiKey),
  },
}))

app.get('/api/projects', async () => ({
  projects: await listProjects(),
}))

app.post('/api/projects', async (request, reply) => {
  const project = await createProject(request.body ?? defaultBrief)
  return reply.status(201).send({ project })
})

app.get('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const project = await getProject(id)

  if (!project) {
    return reply.status(404).send({ error: 'ProjectNotFound' })
  }

  return { project }
})

app.post('/api/projects/:id/generate', async (request, reply) => {
  const { id } = request.params as { id: string }
  const project = await getProject(id)

  if (!project) {
    return reply.status(404).send({ error: 'ProjectNotFound' })
  }

  await resetProduction(id)
  const job = await generationQueue.add('generate-project', { projectId: id })
  return reply.status(202).send({ jobId: job.id })
})

app.post('/api/projects/:id/montage', async (request, reply) => {
  const { id } = request.params as { id: string }
  const project = await getProject(id)

  if (!project) {
    return reply.status(404).send({ error: 'ProjectNotFound' })
  }

  const updatedProject = await prepareMontage(id)
  return reply.status(202).send({ project: updatedProject })
})

app.post('/api/leads', async (request, reply) => {
  const body = normalizeLead(request.body)

  if (!body.name || !body.contact) {
    return reply.status(400).send({ error: 'NameAndContactRequired' })
  }

  const result = await db.query(
    `
      insert into drum_leads
        (service_type, name, contact, city, format, preferred_date, diameter, membrane, rim, tuning, purpose, message)
      values
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning id, created_at
    `,
    [
      body.serviceType,
      body.name,
      body.contact,
      body.city,
      body.format,
      body.preferredDate,
      body.diameter,
      body.membrane,
      body.rim,
      body.tuning,
      body.purpose,
      body.message,
    ],
  )

  await notifyTelegram({
    ...body,
    id: result.rows[0].id,
    createdAt: result.rows[0].created_at,
  })

  return reply.status(201).send({
    lead: {
      id: result.rows[0].id,
      createdAt: result.rows[0].created_at,
    },
  })
})

function normalizeLead(input: unknown) {
  const raw = typeof input === 'object' && input ? input as Record<string, unknown> : {}

  return Object.fromEntries(
    Object.keys(leadDefaults).map((key) => {
      const value = raw[key]
      return [key, typeof value === 'string' ? value.trim().slice(0, 1600) : '']
    }),
  ) as DrumLead
}

async function notifyTelegram(lead: DrumLead & { id: string; createdAt: string }) {
  if (!config.telegramBotToken || !config.telegramChatId) return

  const text = [
    'Новая заявка с сайта Дух Сибири',
    `ID: ${lead.id}`,
    `Дата: ${new Date(lead.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
    `Направление: ${lead.serviceType}`,
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    lead.city ? `Город: ${lead.city}` : '',
    lead.format ? `Формат: ${lead.format}` : '',
    lead.preferredDate ? `Желаемая дата: ${lead.preferredDate}` : '',
    `Диаметр: ${lead.diameter}`,
    `Мембрана: ${lead.membrane}`,
    `Обод: ${lead.rim}`,
    `Настройка: ${lead.tuning}`,
    `Назначение: ${lead.purpose}`,
    lead.message ? `Комментарий: ${lead.message}` : '',
  ].filter(Boolean).join('\n')

  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.telegramChatId,
      text,
      disable_web_page_preview: true,
    }),
  })

  if (!response.ok) {
    app.log.warn({ status: response.status, body: await response.text() }, 'telegram notification failed')
  }
}

const shutdown = async () => {
  await app.close()
  await closeQueue()
  await closeDb()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

await migrate()
await app.listen({ port: config.port, host: config.host })
