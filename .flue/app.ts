import { Hono } from 'hono'
import { flue } from '@flue/runtime/routing'

// User-supplied app owns the entire request pipeline (see the generated
// server entry). We mirror createDefaultFlueApp()'s composition — mount the
// public flue() router at root — but gate every request behind a bearer
// token first.
//
// The Electron main process generates a fresh random FLUE_TOKEN per launch
// and passes it to this child. Together with loopback-only binding
// (hostname 127.0.0.1, applied to the generated serve() call by
// scripts/patch-flue-server.mjs) this keeps the agent backend private to a
// single app instance: nothing else on the machine can reach it without the
// token, and nothing off the machine can reach it at all.
const token = process.env.FLUE_TOKEN?.trim()

const app = new Hono()

app.use('*', async (c, next) => {
  if (!token) {
    return c.json({ error: 'flue backend token not configured' }, 503)
  }
  if (c.req.header('authorization') !== `Bearer ${token}`) {
    return c.json({ error: 'unauthorized' }, 401)
  }
  await next()
})

app.route('/', flue())

export default app
