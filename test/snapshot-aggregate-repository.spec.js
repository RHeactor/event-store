/* global describe, it, before */

import {EventStore} from '../src/event-store'
import {ModelEvent} from '../src/model-event'
import {AggregateRepository} from '../src/aggregate-repository'
import {SnapshotAggregateRepository} from '../src/snapshot-aggregate-repository'
import helper from './helper'
import {expect} from 'chai'
import {AggregateRoot} from '../src/aggregate-root'

class DummyModel extends AggregateRoot {
  applyEvent (event) {
    this.updated(event.createdAt)
  }
}

describe('SnapshotAggregateRepository', () => {
  before(helper.clearDb)

  let snapshotRepo
  let eventStore

  before(() => {
    snapshotRepo = new SnapshotAggregateRepository(new AggregateRepository(
      DummyModel,
      'user',
      helper.redis
    ))
    eventStore = new EventStore('user', helper.redis, 1)
  })

  describe('getById().until()', async () => {
    it('should aggregate only to a given date', async () => {
      const d = new Date('2016-01-02T04:04:05+00:00')
      await Promise
        .all([
          eventStore.persist(new ModelEvent('17', 'EventBefore', {}, new Date('2016-01-02T03:04:05+00:00'))),
          eventStore.persist(new ModelEvent('17', 'EventBefore', {}, d)),
          eventStore.persist(new ModelEvent('17', 'EventAfter', {}, new Date('2016-01-02T05:04:05+00:00')))
        ])
      const aggregate = await snapshotRepo.getById('17').until(new Date('2016-01-02T05:00:00+00:00'))
      expect(aggregate.aggregateVersion()).to.equal(2)
      expect(aggregate.modifiedAt().getTime()).to.equal(d.getTime())
    })
  })
})
