import {EntryAlreadyExistsError, EntryNotFoundError} from '@resourcefulhumans/rheactor-errors'

export class AggregateIndex {
  /**
   * Manages indices for aggregates
   *
   * @param {String} aggregate
   * @param {redis.client} redis
   */
  constructor (aggregate, redis) {
    this.aggregate = aggregate
    this.redis = redis
  }

  /**
   * Add the value to the index of the given type for the aggregate identified by the given aggregateId
   *
   * @param {String} type
   * @param {String} value
   * @param {String} aggregateId
   * @returns {Promise}
   */
  add (type, value, aggregateId) {
    return this.redis.hmset(this.aggregate + '.' + type + '.index', value, aggregateId)
  }

  /**
   * Add the value to the index of the given type for the aggregate identified by the given aggregateId
   * if it is not already present
   *
   * @param {String} type
   * @param {String} value
   * @param {String} aggregateId
   * @returns {Promise}
   * @throws EntryAlreadyExistsError If entry exists
   */
  addIfNotPresent (type, value, aggregateId) {
    let index = this.aggregate + '.' + type + '.index'
    return this.redis.eval(
      'local v = redis.call(\'HMGET\',ARGV[1],ARGV[2]) if v[1] == false then redis.call(\'HMSET\',ARGV[1],ARGV[2],ARGV[3]) return true else return false end',
      0, index, value, aggregateId
    )
      .then((res) => {
        if (res === null) {
          throw new EntryAlreadyExistsError('Entry for index "' + index + '" with key "' + value + '" already ' +
            'exists. Tried to add aggregate "' + aggregateId + '".')
        }
        return true
      })
  }

  /**
   * Remove the aggregate identified by the given aggregateId from the index of the given type for the given value
   *
   * @param {String} type
   * @param {String} value
   * @param {String} aggregateId
   * @returns {Promise}
   */
  remove (type, value, aggregateId) {
    let index = this.aggregate + '.' + type + '.index'
    return this.redis.hdel(index, value, aggregateId)
  }

  /**
   * Add the value to the list of the given type for the aggregate identified by the given aggregateId
   * if it is not already present
   *
   * @param {String} type
   * @param {String} aggregateId
   * @returns {Promise}
   * @throws EntryAlreadyExistsError If entry exists
   */
  addToListIfNotPresent (type, aggregateId) {
    let index = this.aggregate + '.' + type + '.list'
    return this.redis.sadd(index, aggregateId)
      .then((res) => {
        if (!res) {
          throw new EntryAlreadyExistsError('Aggregate "' + aggregateId + '" already member of "' + index + '".')
        }
        return true
      })
  }

  /**
   * Returns the entries of the list
   *
   * @param {String} type
   * @returns {Promise.<Array>}
   */
  getList (type) {
    let index = this.aggregate + '.' + type + '.list'
    return this.redis.smembers(index)
  }

  /**
   * Remove the value from the list of the given type for the aggregate identified by the given aggregateId
   *
   * @param {String} type
   * @param {String} aggregateId
   * @returns {Promise}
   * @throws EntryAlreadyExistsError If entry exists
   */
  removeFromList (type, aggregateId) {
    let index = this.aggregate + '.' + type + '.list'
    return this.redis.srem(index, aggregateId)
  }

  /**
   * Find an aggregateId by the given index type and value
   *
   * @param {String} type
   * @param {String} value
   * @returns {Promise}
   */
  async find (type, value) {
    try {
      return await this.get(type, value)
    } catch (err) {
      return null
    }
  }

  /**
   * Return an aggregateId by the given index type and value
   *
   * @param {String} type
   * @param {String} value
   * @returns {Promise}
   * @throws EntryNotFoundError
   */
  get (type, value) {
    return this.redis
      .hmget(this.aggregate + '.' + type + '.index', value)
      .then((res) => {
        if (res[0] === null) {
          throw new EntryNotFoundError('Aggregate not found with ' + type + ' "' + value + '"')
        }
        return res[0]
      })
  }

  /**
   * Return all aggregateIds in the given index type
   *
   * @param {String} type
   * @returns {Promise}
   */
  getAll (type) {
    return this.redis
      .hvals(this.aggregate + '.' + type + '.index')
  }
}
