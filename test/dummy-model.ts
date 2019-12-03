import {AggregateRoot} from '../src/aggregate-root'
import {UnhandledDomainEventError} from '@resourcefulhumans/rheactor-errors'

export class DummyModel extends AggregateRoot {
  constructor (public email:string) {
    super()
  }

  applyEvent (event) {
    switch (event.name) {
      case 'DummyCreatedEvent':
        this.email = event.data.email
        this.persisted(event.aggregateId, event.createdAt)
        break
      case 'DummyDeletedEvent':
        this.deleted(event.createdAt)
        break
      default:
        throw new UnhandledDomainEventError(event.name)
    }
  }
}
