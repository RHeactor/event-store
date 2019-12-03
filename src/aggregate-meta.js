import {AggregateIdType, MaybeAggregateIdType, AggregateVersionType} from './types'
import {Date as DateType, irreducible, maybe} from 'tcomb'
const MaybeDateType = maybe(DateType)

export class AggregateMeta {
  /**
   * @param {String} id
   * @param {Number} version
   * @param {Date} createdAt
   * @param {Date|undefined} updatedAt
   * @param {Date|undefined} deletedAt
   * @param {String} createdBy
   */
  constructor (id, version, createdAt = new Date(), updatedAt = undefined, deletedAt = undefined, createdBy = undefined) {
    this._id = AggregateIdType(id, ['AggregateMeta', 'id:AggregateId'])
    this._version = AggregateVersionType(version, ['AggregateMeta', 'version:AggregateVersion'])
    this._createdAt = createdAt
    this._updatedAt = MaybeDateType(updatedAt, ['AggregateMeta', 'updatedAt:?Date'])
    this._deletedAt = MaybeDateType(deletedAt, ['AggregateMeta', 'deletedAt:?Date'])
    this._createdBy = MaybeAggregateIdType(createdBy, ['AggregateMeta', 'createdBy:?AggregateId'])
  }

  /**
   * @returns {String}
   */
  get id () {
    return this._id
  }

  /**
   * @returns {Number}
   */
  get version () {
    return this._version
  }

  /**
   * @returns {Date}
   */
  get createdAt () {
    return this._createdAt
  }

  /**
   * @returns {Date|undefined}
   */
  get updatedAt () {
    return this._updatedAt
  }

  /**
   * @returns {Date|undefined}
   */
  get deletedAt () {
    return this._deletedAt
  }

  /**
   * Returns if the aggregate is deleted
   *
   * @returns {Boolean}
   */
  get isDeleted () {
    return this.deletedAt !== undefined
  }

  /**
   * Returns the timestamp when the aggregate was modified the last time, which is the latest value of
   * createdAt, updatedAt or deletedAt
   *
   * @returns {Date}
   */
  get modifiedAt () {
    if (this.deletedAt) {
      return this.deletedAt
    }
    if (this.updatedAt) {
      return this.updatedAt
    }
    return this.createdAt
  }

  /**
   * @returns {Number|undefined}
   */
  get createdBy () {
    return this._createdBy
  }

  /**
   * Returns an instance of this with updated version and the updatedAt timestamp set
   *
   * @param {Date} updatedAt
   * @returns {AggregateMeta}
   */
  updated (updatedAt = new Date()) {
    DateType(updatedAt)
    return new AggregateMeta(this.id, this.version + 1, this.createdAt, updatedAt)
  }

  /**
   * Returns an instance of this with updated version and the deletedAt timestamp set
   *
   * @param {Date} deletedAt
   * @returns {AggregateMeta}
   */
  deleted (deletedAt = new Date()) {
    DateType(deletedAt)
    return new AggregateMeta(this.id, this.version + 1, this.createdAt, this.updatedAt, deletedAt)
  }

  /**
   * Returns true if x is of type AggregateMeta
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof AggregateMeta) || (x && x.constructor && x.constructor.name === AggregateMeta.name && 'id' in x && 'version' in x && 'data' in x && 'createdAt' in x && 'updatedAt' in x && 'deletedAt' in x)
  }
}

export const AggregateMetaType = irreducible('AggregateMetaType', AggregateMeta.is)
