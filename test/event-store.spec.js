/* global describe, it, before */

import {EventStore} from '../src/event-store'
import {ModelEvent} from '../src/model-event'
import {Promise} from 'bluebird'
import helper from './helper'
import {expect} from 'chai'

describe('EventStore', function () {
  before(helper.clearDb)

  let eventStore

  before(function () {
    eventStore = new EventStore('user', helper.redis, 1)
  })

  it('should store an event', async () => {
    let d1 = new Date('2016-01-02T03:04:05+00:00')
    await Promise
      .all([
        eventStore.persist(new ModelEvent('17', 'SomeEvent', {foo: 'bar'}, d1)),
        eventStore.persist(new ModelEvent('17', 'SomeOtherEvent', {foo: 'baz'}, undefined, 'John Doe'))
      ])
    const res = await eventStore.fetch('17')
    expect(res.length).to.equal(2)
    expect(res[0]).to.be.instanceof(ModelEvent)
    expect(res[0].name).to.equal('SomeEvent')
    expect(res[0].data).to.deep.equal({foo: 'bar'})
    expect(res[0].createdAt).to.be.a('Date')
    expect(res[0].createdAt).to.at.least(d1)
    expect(res[0].createdBy).to.equal(undefined)
    expect(res[1]).to.be.instanceof(ModelEvent)
    expect(res[1].name).to.equal('SomeOtherEvent')
    expect(res[1].data).to.deep.equal({foo: 'baz'})
    expect(res[1].createdAt).to.be.a('Date')
    expect(res[1].createdAt).to.be.above(d1) // Use new Date() as default createdAt
    expect(res[1].createdBy).to.equal('John Doe')
  })

  it('should store handle events without a created date', async () => {
    let d1 = new Date('1970-01-01T00:00:00+00:00')
    await Promise.resolve(helper.redis.rpushAsync('user.events.42', JSON.stringify({eventType: 'SomeEventWithOutCreatedDate'})))
    const res = await eventStore.fetch('42')
    expect(res.length).to.equal(1)
    expect(res[0]).to.be.instanceof(ModelEvent)
    expect(res[0].name).to.equal('SomeEventWithOutCreatedDate')
    expect(res[0].createdAt).to.be.a('Date')
    expect(res[0].createdAt).to.at.least(d1)
  })
})
