/* global describe, it, before */

import {AggregateRelation} from '../src/aggregate-relation'
import {AggregateRepository} from '../src/aggregate-repository'
import {Promise} from 'bluebird'
import helper from './helper'
import {expect} from 'chai'
import {DummyModel} from './dummy-model'

describe('AggregateRelation', function () {
  before(helper.clearDb)

  let repository, relation

  before(() => {
    repository = new AggregateRepository(
      DummyModel,
      'dummy',
      helper.redis
    )
    relation = new AggregateRelation(repository, helper.redis)
  })

  it('should add items', async () => {
    const josh = new DummyModel('josh.doe@example.invalid')
    const jasper = new DummyModel('jasper.doe@example.invalid')
    const [event1, event2] = await Promise.all([
      repository.add(josh),
      repository.add(jasper)
    ])
    await Promise
      .all([
        relation.addRelatedId('meeting', '42', event1.aggregateId),
        relation.addRelatedId('meeting', '42', event2.aggregateId)
      ])
    const [u1, u2] = await relation.findByRelatedId('meeting', '42')
    expect(u1.email).to.equal('josh.doe@example.invalid')
    expect(u2.email).to.equal('jasper.doe@example.invalid')
  })

  it('should remove items', async () => {
    const jill = new DummyModel('jill.doe@example.invalid')
    const jane = new DummyModel('jane.doe@example.invalid')
    const [event1, event2] = await Promise.all([
      repository.add(jill),
      repository.add(jane)
    ])
    await Promise
      .all([
        relation.addRelatedId('acme', '17', event1.aggregateId),
        relation.addRelatedId('acme', '17', event2.aggregateId)
      ])
    await relation.removeRelatedId('acme', '17', event1.aggregateId)
    const items = await relation.findByRelatedId('acme', '17')
    expect(items.length).to.equal(1)
    expect(items[0].email).to.equal('jane.doe@example.invalid')
  })
})
