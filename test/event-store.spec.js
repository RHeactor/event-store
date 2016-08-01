'use strict'

/* global describe, it, before */

const EventStore = require('../event-store')
const ModelEvent = require('../model-event')
const Promise = require('bluebird')
const helper = require('./helper')
const expect = require('chai').expect

describe('EventStore', function () {
  before(helper.clearDb)

  let eventStore

  before(function () {
    eventStore = new EventStore('user', helper.redis, 1)
  })

  it('should store an event', () => {
    let d1 = new Date('2016-01-02T03:04:05+00:00').getTime()
    return Promise
      .join(
        eventStore.persist(new ModelEvent(17, 'SomeEvent', {foo: 'bar'}, d1)),
        eventStore.persist(new ModelEvent(17, 'SomeOtherEvent', {foo: 'baz'}, null, 'John Doe'))
      )
      .then(() => {
        return eventStore.fetch(17)
      })
      .then((res) => {
        expect(res.length).to.equal(2)
        expect(res[0]).to.be.instanceof(ModelEvent)
        expect(res[0].name).to.equal('SomeEvent')
        expect(res[0].data).to.deep.equal({foo: 'bar'})
        expect(res[0].createdAt).to.be.a('Number')
        expect(res[0].createdAt).to.equal(d1)
        expect(res[0].createdBy).to.equal(undefined)
        expect(res[1]).to.be.instanceof(ModelEvent)
        expect(res[1].name).to.equal('SomeOtherEvent')
        expect(res[1].data).to.deep.equal({foo: 'baz'})
        expect(res[1].createdAt).to.be.a('Number')
        expect(res[1].createdAt).to.be.above(d1) // Use Date.now() as default createdAt
        expect(res[1].createdBy).to.equal('John Doe')
      })
  })
})
