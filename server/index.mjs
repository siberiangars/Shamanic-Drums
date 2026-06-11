// Дух Сибири — приём заявок: сохранение в Postgres + уведомление в Telegram.
// Запуск: node server/index.mjs  (переменные берутся из server/.env)
import Fastify from 'fastify'
import cors from '@fastify/cors'
import pg from 'pg'
import { z } from 'zod'

const { Pool } = pg

const PORT = Number(process.env.PORT || 8787)
const BOT = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT = process.env.TELEGRAM_CHAT_ID || ''
const CORS_ORIGIN = process.env.CORS_ORIGIN || true // в проде nginx отдаёт сайт и API с одного домена

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required (see server/.env.example)')
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const s = (max) => z.string().trim().max(max).optional().default('')
const LeadSchema = z.object({
  serviceType: s(200),
  name: z.string().trim().min(1, 'name required').max(200),
  contact: z.string().trim().min(1, 'contact required').max(200),
  city: s(200),
  format: s(200),
  preferredDate: s(200),
  diameter: s(200),
  membrane: s(200),
  rim: s(200),
  tuning: s(200),
  purpose: s(500),
  message: s(4000),
  // honeypot — скрытое поле, боты часто его заполняют
  website: s(200).optional(),
})

const app = Fastify({ logger: true, trustProxy: true, bodyLimit: 64 * 1024 })
await app.register(cors, { origin: CORS_ORIGIN, methods: ['POST', 'GET'] })

app.get('/api/health', async () => ({ ok: true, ts: Date.now() }))

app.post('/api/leads', async (req, reply) => {
  const parsed = LeadSchema.safeParse(req.body)
  if (!parsed.success) {
    return reply.code(400).send({ ok: false, error: 'invalid_payload' })
  }
  const d = parsed.data

  // honeypot: если заполнен website — тихо принимаем, но не сохраняем (спам-бот)
  if (d.website) return reply.send({ ok: true })

  let id
  try {
    const r = await pool.query(
      `insert into leads
         (service_type, name, contact, city, format, preferred_date, diameter, membrane, rim, tuning, purpose, message, ip, user_agent)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       returning id`,
      [
        d.serviceType, d.name, d.contact, d.city, d.format, d.preferredDate,
        d.diameter, d.membrane, d.rim, d.tuning, d.purpose, d.message,
        req.ip || '', String(req.headers['user-agent'] || '').slice(0, 300),
      ],
    )
    id = r.rows[0].id
  } catch (err) {
    req.log.error({ err }, 'db insert failed')
    return reply.code(500).send({ ok: false, error: 'storage' })
  }

  // Уведомление в Telegram. Заявка уже сохранена — если ТГ упадёт, ответ всё равно ок.
  if (BOT && CHAT) {
    const text = [
      '🔥 Новая заявка — Дух Сибири',
      `Направление: ${d.serviceType || '—'}`,
      `Имя: ${d.name}`,
      `Контакт: ${d.contact}`,
      d.city && `Город: ${d.city}`,
      d.purpose && `Что нужно: ${d.purpose}`,
      d.message && `Комментарий: ${d.message}`,
      `№${id}`,
    ].filter(Boolean).join('\n')
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
      })
      if (!res.ok) req.log.error({ body: await res.text() }, 'telegram send failed')
    } catch (err) {
      req.log.error({ err }, 'telegram error')
    }
  }

  return reply.send({ ok: true, id })
})

app.listen({ port: PORT, host: '127.0.0.1' })
  .then(() => app.log.info(`leads api listening on 127.0.0.1:${PORT}`))
  .catch((err) => { app.log.error(err); process.exit(1) })
