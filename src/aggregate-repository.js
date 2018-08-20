import {EventStore} from './event-store'
import {ModelEvent, ModelEventType, ModelEventTypeList} from './model-event'
import {EntryNotFoundError, EntryDeletedError} from '@resourcefulhumans/rheactor-errors'
import {Promise} from 'bluebird'
import {AggregateRoot, AggregateRootType} from './aggregate-root'
import {MaybeStringType, AggregateIdType} from './types'
import {irreducible} from 'tcomb'

/**
 * @deprecated Use ImmutableAggregateRepository
 */
export class AggregateRepository {
  /**
   * Creates a new aggregate repository
   *
   * @param {AggregateRoot} aggregateRoot
   * @param {String} aggregateAlias
   * @param {redis.client} redis
   */
  constructor (aggregateRoot, aggregateAlias, redis) {
    this.aggregateRoot = aggregateRoot
    this.aggregateAlias = aggregateAlias
    this.aggregateAliasPrefix = aggregateAlias.charAt(0).toUpperCase() + aggregateAlias.slice(1)
    this.eventStore = new EventStore(aggregateAlias, redis)
    this.redis = redis
  }

  /**
   * Generic method for add aggregates to the collection.
   * The repository will assign an ID to them.
   *
   * Calls applyEvent with the created event on the aggregate.
   *
   * @param {AggregateRoot} aggregate
   * @param {String} createdBy
   * @returns {Promise.<ModelEvent>}
   */
  add (aggregate, createdBy) {
    AggregateRootType(aggregate)
    MaybeStringType(createdBy)
    return this.redis.incrAsync(this.aggregateAlias + ':id')
      .then((id) => {
        const event = new ModelEvent('' + id, this.aggregateAliasPrefix + 'CreatedEvent', aggregate, new Date(), createdBy)
        return this.persistEvent(event)
          .then(() => {
            aggregate.applyEvent(event)
            return event
          })
      })
  }

  /**
   * Generic method to persist model events
   *
   * @param {ModelEvent} modelEvent
   * @return {Promise.<ModelEvent>}
   */
  persistEvent (modelEvent) {
    ModelEventType(modelEvent)
    return this.eventStore.persist(modelEvent).then(() => modelEvent)
  }

  /**
   * Generic method for removing aggregates from the collection
   *
   * Calls applyEvent with the created event on the aggregate.
   *
   * @param {AggregateRoot} aggregate
   * @param {String} createdBy
   * @returns {Promise.<ModelEvent>}
   */
  remove (aggregate, createdBy) {
    AggregateRootType(aggregate)
    MaybeStringType(createdBy)
    const event = new ModelEvent(aggregate.aggregateId(), this.aggregateAliasPrefix + 'DeletedEvent', aggregate, new Date(), createdBy)
    return this.persistEvent(event)
      .then(() => {
        aggregate.applyEvent(event)
        return event
      })
  }

  /**
   * Generic method for loading aggregates by id
   *
   * @param {String} id
   * @returns {Promise.<AggregateRoot>} or undefined if not found
   */
  findById (id) {
    AggregateIdType(id)
    return this.eventStore.fetch(id)
      .then(events => this.aggregate(events))
      .then((aggregate) => {
        if (!aggregate) return
        return aggregate.isDeleted() ? undefined : aggregate
      })
  }

  /**
   * Load aggregate by id including deleted aggregates
   *
   * @param {String} id
   * @returns {Promise.<AggregateRoot>} or undefined if not found
   */
  findByIdWithDeleted (id) {
    AggregateIdType(id)
    return this.eventStore.fetch(id)
      .then(events => this.aggregate(events))
  }

  /**
   * Creates an instance of this repositories aggregate root by applying all events
   *
   * NOTE: Because the signature of the AggregateRoot's constructor may change
   * over time, we bypass the individual constructor of the Model. The model
   * is passed the the complete list of events (including the created event)
   * and must construct itthis from that list.
   * This way we can keep hard checks when constructing new model instance from
   * code "new MyExampleModel(arg)" but can handle changing payload of the created
   * event over time.
   *
   * @deprecated Because this method bypasses the Model constructor it will very likely be removed in the future.
   *
   * @param {Array.<ModelEvent>} events
   * @returns {AggregateRoot|undefined}
   */
  aggregate (events) {
    ModelEventTypeList(events)
    if (!events.length) {
      return
    }
    let model = Object.create(this.aggregateRoot.prototype) // Instantiate model
    AggregateRoot.call(model) // Bypass the model constructor, but init necessary data
    events.map(model.applyEvent.bind(model))
    return model
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
    return this.redis.getAsync(this.aggregateAlias + ':id')
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
    AggregateIdType(id)
    return this.eventStore.fetch(id)
      .then(events => this.eventsToAggregate(id, events))
  }

  eventsToAggregate (id, events) {
    AggregateIdType(id)
    ModelEventTypeList(events)
    const aggregate = this.aggregate(events)
    if (!aggregate) {
      throw new EntryNotFoundError(this.aggregateAlias + ' with id "' + id + '" not found.')
    }
    if (aggregate.isDeleted()) {
      throw new EntryDeletedError(this.aggregateAlias + ' with id "' + id + '" is deleted.', aggregate)
    }
    return aggregate
  }

  /**
   * Returns true if x is of type AggregateRepository
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (
      x instanceof AggregateRepository) || (
        x && x.constructor && x.constructor.name === AggregateRepository.name &&
        'aggregateRoot' in x && 'aggregateAlias' in x && 'aggregateAliasPrefix' in x && 'eventStore' in x && 'redis' in x
      )
  }
}

export const AggregateRepositoryType = irreducible('AggregateRepositoryType', AggregateRepository.is)
