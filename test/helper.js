import {Promise} from 'bluebird'
import { RedisClient, Multi, createClient } from 'redis'
Promise.promisifyAll(RedisClient.prototype)
Promise.promisifyAll(Multi.prototype)

const client = createClient({
  host: '172.17.0.3'
})

client.select(8)

export default {
  clearDb() {
    return client.flushdb()
  }, 
  redis: client

}
