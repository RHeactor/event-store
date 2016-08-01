'use strict'

/* global describe, it, before */

const ModelEvent = require('../model-event')
const expect = require('chai').expect
const Errors = require('rheactor-value-objects/errors')

describe('ModelEvent', () => {
  it('should have default values', (done) => {
    let e = new ModelEvent()
    expect(e.data).to.deep.equal({})
    expect(e.createdAt).to.be.at.most(Date.now())
    expect(e.createdBy).to.equal(undefined)
    done()
  })
})
