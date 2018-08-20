import {EventStore} from './event-store'
import {ModelEvent, ModelEventType} from './model-event'
import {EntryNotFoundError, EntryDeletedError} from '@resourcefulhumans/rheactor-errors'
import {Promise} from 'bluebird'
import {ImmutableAggregateRootType} from './immutable-aggregate-root'
import {MaybeStringType, AggregateIdType} from './types'
import {irreducible, String as StringType, Function as FunctionType, Object as ObjectType} from 'tcomb'

export class ImmutableAggregateRepository {
  /**
   * Creates a new aggregate repository
   *
   * @param {ImmutableAggregateRoot} {applyEvent: {Function}}
   * @param {String} alias
   * @param {redis.client} redis
   */
  constructor ({applyEvent}, alias, redis) {
    FunctionType(applyEvent, ['ImmutableAggregateRepository', 'root:ImmutableAggregateRoot'])
    StringType(alias, ['ImmutableAggregateRepository', 'alias:String'])
    this.applyEvent = applyEvent
    this.alias = alias
    this.prefix = alias.charAt(0).toUpperCase() + alias.slice(1)
    this.eventStore = new EventStore(alias, redis)
    this.redis = redis
  }

  /**
   * Generic method for add aggregates to the collection.
   * The repository will assign an ID to them.
   *
   * Calls applyEvent with the created event on the aggregate.
   *
   * @param {Object} data
   * @param {String} createdBy
   * @returns {Promise.<ModelEvent>}
   */
  add (data, createdBy) {
    ObjectType(data, ['ImmutableAggregateRepository', 'add()', 'data:Object'])
    MaybeStringType(createdBy, ['ImmutableAggregateRepository', 'add()', 'createdBy:?String'])
    return this.redis.incrAsync(this.alias + ':id')
      .then((id) => this.persistEvent(new ModelEvent('' + id, this.prefix + 'CreatedEvent', data, new Date(), createdBy)))
  }

  /**
   * Generic method to persist model events
   *
   * @param {ModelEvent} modelEvent
   * @return {Promise.<ModelEvent>}
   */
  persistEvent (modelEvent) {
    ModelEventType(modelEvent, ['ImmutableAggregateRepository', 'persistEvent()', 'modelEvent:ModelEvent'])
    return this.eventStore.persist(modelEvent).then(() => modelEvent)
  }

  /**
   * Generic method for removing aggregates from the collection
   *
   * @param {AggregateRoot} aggregate
   * @param {String} createdBy
   * @returns {Promise.<ModelEvent>}
   */
  remove (aggregate, createdBy) {
    ImmutableAggregateRootType(aggregate, ['ImmutableAggregateRepository', 'remove()', 'aggregate:ImmutableAggregateRoot'])
    MaybeStringType(createdBy, ['ImmutableAggregateRepository', 'remove()', 'createdBy:?String'])
    return this.persistEvent(new ModelEvent(aggregate.meta.id, this.prefix + 'DeletedEvent', aggregate, new Date(), createdBy))
  }

  /**
   * Generic method for loading aggregates by id
   *
   * @param {String} id
   * @returns {Promise.<AggregateRoot>} or undefined if not found
   */
  findById (id) {
    AggregateIdType(id, ['ImmutableAggregateRepository', 'findById()', 'id:AggregateId'])
    return this.eventStore.fetch(id)
      .reduce((aggregate, event) => this.applyEvent(event, aggregate === false ? undefined : aggregate), false)
      .then(aggregate => {
        if (!aggregate) return
        return aggregate.meta.isDeleted ? undefined : aggregate
      })
  }

  /**
   * Returns all entities
   *
   * NOTE: naively returns all entities by fetching them one by one by ID starting
   * from 1 to the current max id.
   *
   * @returns {Promise.<Array.<AggregateRoot>>}
   */
  findAll () {
    return this.redis.getAsync(this.alias + ':id')
      .then((maxId) => {
        let promises = []
        for (let i = 1; i <= maxId; i++) {
          promises.push(this.findById('' + i))
        }
        return Promise.all(promises)
      })
      .filter((item) => {
        return item !== undefined
      })
  }

  /**
   * Generic method for loading aggregates by id
   *
   * @param {String} id
   * @returns {Promise.<AggregateRoot>}
   * @throws {EntryNotFoundError} if entity is not found
   */
  getById (id) {
    AggregateIdType(id, ['ImmutableAggregateRepository', 'getById()', 'id:AggregateId'])
    return this.eventStore.fetch(id)
      .reduce((aggregate, event) => this.applyEvent(event, aggregate === false ? undefined : aggregate), false)
      .then(aggregate => {
        if (!aggregate) {
          throw new EntryNotFoundError(this.alias + ' with id "' + id + '" not found.')
        }
        if (aggregate.meta.isDeleted) {
          throw new EntryDeletedError(this.alias + ' with id "' + id + '" is deleted.', aggregate)
        }
        return aggregate
      })
  }

  /**
   * Load aggregate by id including deleted aggregates
   *
   * @param {String} id
   * @returns {Promise.<AggregateRoot>}
   * @throws {EntryNotFoundError} if entity is not found
   */
  findByIdWithDeleted (id) {
    AggregateIdType(id, ['ImmutableAggregateRepository', 'getById()', 'id:AggregateId'])
    return this.eventStore.fetch(id)
      .reduce((aggregate, event) => this.applyEvent(event, aggregate === false ? undefined : aggregate), false)
      .then(aggregate => {
        if (!aggregate) {
          throw new EntryNotFoundError(this.alias + ' with id "' + id + '" not found.')
        }
        return aggregate
      })
  }

  /**
   * Returns true if x is of type ImmutableAggregateRepository
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (
      x instanceof ImmutableAggregateRepository) || (
        x && x.constructor && x.constructor.name === ImmutableAggregateRepository.name &&
        'root' in x && 'alias' in x && 'prefix' in x && 'eventStore' in x && 'redis' in x
      )
  }
}

export const ImmutableAggregateRepositoryType = irreducible('ImmutableAggregateRepositoryType', ImmutableAggregateRepository.is)
