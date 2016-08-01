'use strict'

/* global describe, it */

const AggregateRoot = require('../aggregate-root')
const expect = require('chai').expect
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')

describe('AggregateRoot', () => {
  describe('.persisted', () => {
    it('should throw an ValidationFailedError on invalid data', (done) => {
      let a = new AggregateRoot()
      expect(a.persisted.bind(a, 0, 0)).to.throw(ValidationFailedError)
      done()
    })
  })
  describe('.updated', () => {
    it('should throw an ValidationFailedError on invalid data', (done) => {
      let a = new AggregateRoot()
      expect(a.updated.bind(a, -1)).to.throw(ValidationFailedError)
      done()
    })
  })
  describe('.deleted', () => {
    it('should throw an ValidationFailedError on invalid data', (done) => {
      let a = new AggregateRoot()
      expect(a.deleted.bind(a, -1)).to.throw(ValidationFailedError)
      done()
    })
  })
  describe('.createdAt()', () => {
    it('should return time of creation', (done) => {
      let a = new AggregateRoot()
      let createdAt = new Date('2016-01-01T03:04:05+00:00').getTime()
      a.persisted('42', createdAt)
      expect(a.createdAt()).to.equal(createdAt)
      expect(a.modifiedAt()).to.equal(createdAt)
      done()
    })
    it('should default to Date.now()', (done) => {
      let a = new AggregateRoot()
      a.persisted('42')
      expect(a.createdAt()).to.be.at.most(Date.now())
      done()
    })
  })
  describe('.updatedAt()', () => {
    it('should return time of updating', (done) => {
      let a = new AggregateRoot()
      let createdAt = new Date('2016-01-01T03:04:05+00:00').getTime()
      let updatedAt = new Date('2016-01-02T03:04:05+00:00').getTime()
      a.persisted('42', createdAt)
      a.updated(updatedAt)
      expect(a.updatedAt()).to.equal(updatedAt)
      expect(a.modifiedAt()).to.equal(updatedAt)
      done()
    })
    it('should default to Date.now()', (done) => {
      let a = new AggregateRoot()
      let createdAt = new Date('2016-01-01T03:04:05+00:00').getTime()
      a.persisted('42', createdAt)
      a.updated()
      expect(a.updatedAt()).to.be.at.most(Date.now())
      done()
    })
  })
  describe('.deletedAt()', () => {
    it('should return time of deleting', (done) => {
      let a = new AggregateRoot()
      let createdAt = new Date('2016-01-01T03:04:05+00:00').getTime()
      let updatedAt = new Date('2016-01-02T03:04:05+00:00').getTime()
      let deletedAt = new Date('2016-01-03T03:04:05+00:00').getTime()
      a.persisted('42', createdAt)
      a.updated(updatedAt)
      a.deleted(deletedAt)
      expect(a.deletedAt()).to.equal(deletedAt)
      expect(a.modifiedAt()).to.equal(deletedAt)
      done()
    })
    it('should default to Date.now()', (done) => {
      let a = new AggregateRoot()
      let createdAt = new Date('2016-01-01T03:04:05+00:00').getTime()
      let updatedAt = new Date('2016-01-02T03:04:05+00:00').getTime()
      a.persisted('42', createdAt)
      a.updated(updatedAt)
      a.deleted()
      expect(a.deletedAt()).to.be.at.most(Date.now())
      done()
    })
  })
  describe('.modifiedAt()', () => {
    it('should return the last modified date if it has no creation date (legacy)', (done) => {
      let a = new AggregateRoot()
      a.persisted('42')
      let updatedAt = new Date('2016-01-02T03:04:05+00:00').getTime()
      a.updated(updatedAt)
      expect(a.modifiedAt()).to.equal(updatedAt)
      done()
    })
  })
})
