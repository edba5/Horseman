import { router } from './router.js'

export { WriterDO } from './lib/writer.mjs'

import './api_v1/auth/accounts.js'
import './api_v1/models/models.js'
import './api_v1/models/content.js'
import './init.js'

export default {
    async fetch(request, env, ctx) {
        globalThis.env = env
        globalThis.ctx = ctx

        globalThis.cost = {
            read: 0, // Times we asked KV for data
            write: 0, // Times we wrote to KV
            cache_read: 0 // Times we found a cached result
        }

        const log = []

        globalThis.increase_cost = (t) => {
            globalThis.cost[t] += 1
        }

        globalThis.log = (l) => {
            log.push(l)
        }

        if (!globalThis.MINIFLARE) {
            router.corsConfig.allowOrigin = 'https://wordful.ceru.dev'
            router.corsConfig.allowHeaders = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        }

        let resp

        try {
            resp = await router.handle(request)
        } catch (e) {
            console.error(e.toString())
        }

        const response = new Response(resp.body, resp)

        response.headers.set('X-Cost', JSON.stringify(cost))
        response.headers.set('X-Log', JSON.stringify(log))

        return response
    }
}
