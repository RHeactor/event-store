/* global describe, it */

import {AggregateMeta} from '../src'
import {expect} from 'chai'

describe('AggregateMeta', () => {
  describe('constructur', () => {
    it('should set id and version', () => {
      const a = new AggregateMeta('17', 1)
      expect(a.id).to.equal('17')
      expect(a.version).to.equal(1)
    })
  })
  describe('.updated', () => {
    it('should increase the version and set the updated date', () => {
      const a = new AggregateMeta('17', 1).updated()
      expect(a.version).to.equal(2)
      expect(a.updatedAt).to.be.at.most(new Date())
    })
    it('should throw an TypeError on invalid data', () => {
      const a = new AggregateMeta('17', 1)
      expect(a.updated.bind(a, -1)).to.throw(TypeError)
    })
  })
  describe('.deleted', () => {
    it('should increase the version and set the deleted date', () => {
      const a = new AggregateMeta('17', 1).deleted()
      expect(a.version).to.equal(2)
      expect(a.deletedAt).to.be.at.most(new Date())
    })
    it('should throw an TypeError on invalid data', () => {
      const a = new AggregateMeta('17', 1)
      expect(a.deleted.bind(a, -1)).to.throw(TypeError)
    })
  })
  describe('.createdAt', () => {
    it('should return time of creation', () => {
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const a = new AggregateMeta('17', 1, createdAt)
      expect(a.createdAt).to.equal(createdAt)
      expect(a.modifiedAt).to.equal(createdAt)
    })
    it('should default to new Date()', () => {
      const a = new AggregateMeta('17', 1)
      expect(a.createdAt).to.be.at.most(new Date())
    })
  })
  describe('.updatedAt', () => {
    it('should return time of updating', () => {
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const a = new AggregateMeta('17', 1, createdAt)
      const updatedAt = new Date('2016-01-02T03:04:05+00:00')
      const a2 = a.updated(updatedAt)
      expect(a2.updatedAt).to.equal(updatedAt)
      expect(a2.modifiedAt).to.equal(updatedAt)
    })
    it('should default to new Date()', () => {
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const a = new AggregateMeta('17', 1, createdAt)
      const a2 = a.updated()
      expect(a2.updatedAt).to.be.at.most(new Date())
    })
  })
  describe('.deletedAt', () => {
    it('should return time of deleting', () => {
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const updatedAt = new Date('2016-01-02T03:04:05+00:00')
      const deletedAt = new Date('2016-01-03T03:04:05+00:00')
      const a = new AggregateMeta('17', 1, createdAt)
      const a3 = a.updated(updatedAt).deleted(deletedAt)
      expect(a3.deletedAt).to.equal(deletedAt)
      expect(a3.modifiedAt).to.equal(deletedAt)
    })
    it('should default to new Date()', () => {
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const updatedAt = new Date('2016-01-02T03:04:05+00:00')
      const a = new AggregateMeta('17', 1, createdAt)
      const a3 = a.updated(updatedAt).deleted()
      expect(a3.deletedAt).to.be.at.most(new Date())
    })
  })
  describe('.isDeleted', () => {
    it('should return false if entity is not deleted', () => {
      const a = new AggregateMeta('17', 1)
      expect(a.isDeleted).to.equal(false)
    })
    it('should return true if entity is deleted', () => {
      const a = new AggregateMeta('17', 1).deleted()
      expect(a.isDeleted).to.equal(true)
    })
  })
  describe('.createdBy', () => {
    it('should return id of the creator', () => {
      const a = new AggregateMeta('17', 1, undefined, undefined, undefined, '42')
      expect(a.createdBy).to.equal('42')
    })
    it('should default to new undefined', () => {
      const a = new AggregateMeta('17', 1)
      expect(a.createdBy).to.equal(undefined)
    })
  })
  describe('.is()', () => {
    it('should return true, if ImmutableAggregateRoot is passed', () => {
      expect(AggregateMeta.is(new AggregateMeta('17', 1))).to.equal(true)
    })
    it('should return true, if a similar object is passed', () => {
      const meta = {
        constructor: {name: AggregateMeta.name},
        id: null,
        version: null,
        data: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
      }
      expect(AggregateMeta.is(meta)).to.equal(true)
    })
  })
})
