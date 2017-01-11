import {String as StringType, Date as DateType, irreducible} from 'tcomb'

export class AggregateRoot {
  /**
   * Base class for aggregates
   */
  constructor () {
    Object.defineProperty(this, '$aggregateMeta', {
      value: {
        id: null,
        version: null,
        deleted: false,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
      }
    })
  }

  /**
   * @param {String} aggregateId
   * @param {Date} createdAt
   */
  persisted (aggregateId, createdAt = new Date()) {
    StringType(aggregateId)
    DateType(createdAt)
    this.$aggregateMeta.id = aggregateId
    this.$aggregateMeta.version = 1
    this.$aggregateMeta.createdAt = createdAt
  }

  /**
   * @param {Date} updatedAt
   * @returns {Number}
   */
  updated (updatedAt = new Date()) {
    DateType(updatedAt)
    this.$aggregateMeta.updatedAt = updatedAt
    return ++this.$aggregateMeta.version
  }

  /**
   * @param {Date} deletedAt
   * @returns {number}
   */
  deleted (deletedAt = new Date()) {
    DateType(deletedAt)
    this.$aggregateMeta.deletedAt = deletedAt
    this.$aggregateMeta.deleted = true
    return ++this.$aggregateMeta.version
  }

  /**
   * Returns the aggregate version
   *
   * @returns {number} Version of the aggregation
   */
  aggregateVersion () {
    return this.$aggregateMeta.version
  }

  /**
   * Returns the aggregate id
   *
   * @returns {String} ID of the aggregation
   */
  aggregateId () {
    return this.$aggregateMeta.id
  }

  /**
   * Returns if the aggregate is deleted
   *
   * @returns {Boolean}
   */
  isDeleted () {
    return this.$aggregateMeta.deleted
  }

  /**
   * Returns the timestamp when the aggregate was created
   *
   * @returns {Number}
   */
  createdAt () {
    return this.$aggregateMeta.createdAt
  }

  /**
   * Returns the timestamp when the aggregate was updated
   *
   * @returns {Number|null}
   */
  updatedAt () {
    return this.$aggregateMeta.updatedAt
  }

  /**
   * Returns the timestamp when the aggregate was modified the last time, which is the latest value of
   * createdAt, updatedAt or deletedAt
   *
   * @returns {Number}
   */
  modifiedAt () {
    if (this.$aggregateMeta.deletedAt) {
      return this.$aggregateMeta.deletedAt
    }
    if (this.$aggregateMeta.updatedAt) {
      return this.$aggregateMeta.updatedAt
    }
    return this.$aggregateMeta.createdAt
  }

  /**
   * Returns the timestamp when the aggregate was deleted
   *
   * @returns {Number|null}
   */
  deletedAt () {
    return this.$aggregateMeta.deletedAt
  }

  /**
   * Returns true if x is of type AggregateRoot
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof AggregateRoot) || (x && x.constructor && x.constructor.name === AggregateRoot.name && '$aggregateMeta' in x)
  }
}

export const AggregateRootType = irreducible('AggregateRootType', AggregateRoot.is)