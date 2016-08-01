'use strict'

/* global describe, it */

const ModelEvent = require('../model-event')
const expect = require('chai').expect

describe('ModelEvent', () => {
  it('should have default values', (done) => {
    let e = new ModelEvent()
    expect(e.data).to.deep.equal({})
    expect(e.createdAt).to.be.at.most(Date.now())
    expect(e.createdBy).to.equal(undefined)
    done()
  })
})
