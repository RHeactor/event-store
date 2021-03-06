import {AggregateRepositoryType} from './aggregate-repository'
import {AggregateIdType} from './types'
import {Date as DateType} from 'tcomb'

export class SnapshotAggregateRepository {
  constructor (repo) {
    AggregateRepositoryType(repo)
    this.repo = repo
  }

  /**
   * Returns a scope function, which needs to be called with at
   * @param {String} id
   * @return {Function}
   */
  getById (id) {
    AggregateIdType(id)
    return {
      until: until => {
        DateType(until)
        return this.repo.eventStore.fetch(id)
          .filter(event => event.createdAt <= until)
          .then(events => this.repo.eventsToAggregate(id, events))
      }
    }
  }
}
