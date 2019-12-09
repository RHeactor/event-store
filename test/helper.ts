import { createHandyClient } from 'handy-redis';

const client = createHandyClient({
  host: process.env.REDIS_HOST
})

client.select(8)

export default {
  clearDb () {
    return client.flushdb()
  },
  redis: client
}
