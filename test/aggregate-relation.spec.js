'use strict'

/* global describe, it, before */

const AggregateRelation = require('../aggregate-relation')
const AggregateRepository = require('../aggregate-repository')
const Promise = require('bluebird')
const helper = require('./helper')
const expect = require('chai').expect
const DummyModel = require('./dummy-model')

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

  it('should add items', () => {
    const josh = new DummyModel('josh.doe@example.invalid')
    const jasper = new DummyModel('jasper.doe@example.invalid')
    return Promise.join(repository.add(josh), repository.add(jasper))
      .spread((event1, event2) => {
        return Promise
          .join(
            relation.addRelatedId('meeting', '42', event1.aggregateId),
            relation.addRelatedId('meeting', '42', event2.aggregateId)
          )
          .then(() => {
            return relation.findByRelatedId('meeting', '42')
          })
          .spread((u1, u2) => {
            expect(u1.email).to.equal('josh.doe@example.invalid')
            expect(u2.email).to.equal('jasper.doe@example.invalid')
          })
      })
  })

  it('should remove items', () => {
    const jill = new DummyModel('jill.doe@example.invalid')
    const jane = new DummyModel('jane.doe@example.invalid')
    return Promise.join(repository.add(jill), repository.add(jane))
      .spread((event1, event2) => {
        return Promise
          .join(
            relation.addRelatedId('acme', '17', event1.aggregateId),
            relation.addRelatedId('acme', '17', event2.aggregateId)
          )
          .then(() => relation.removeRelatedId('acme', '17', event1.aggregateId))
          .then(() => relation.findByRelatedId('acme', '17'))
          .then((items) => {
            expect(items.length).to.equal(1)
            expect(items[0].email).to.equal('jane.doe@example.invalid')
          })
      })
  })
})
