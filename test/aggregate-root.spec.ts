/* global describe, it */

import {AggregateRoot} from '../src/aggregate-root'
import {ModelEvent} from '../src/model-event'
import {expect} from 'chai'

describe('AggregateRoot', () => {
  describe('.persisted', () => {
    it('should throw an TypeError on invalid data', () => {
      const a = new AggregateRoot()
      expect(a.persisted.bind(a, 0, 0)).to.throw(TypeError)
    })
  })
  describe('.updated', () => {
    it('should throw an TypeError on invalid data', () => {
      const a = new AggregateRoot()
      expect(a.updated.bind(a, -1)).to.throw(TypeError)
    })
  })
  describe('.deleted', () => {
    it('should throw an TypeError on invalid data', () => {
      const a = new AggregateRoot()
      expect(a.deleted.bind(a, -1)).to.throw(TypeError)
    })
  })
  describe('.createdAt()', () => {
    it('should return time of creation', () => {
      const a = new AggregateRoot()
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      a.persisted('42', createdAt)
      expect(a.createdAt()).to.equal(createdAt)
      expect(a.modifiedAt()).to.equal(createdAt)
    })
    it('should default to new Date()', () => {
      const a = new AggregateRoot()
      a.persisted('42')
      expect(a.createdAt()).to.be.at.most(new Date())
    })
  })
  describe('.updatedAt()', () => {
    it('should return time of updating', () => {
      const a = new AggregateRoot()
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const updatedAt = new Date('2016-01-02T03:04:05+00:00')
      a.persisted('42', createdAt)
      a.updated(updatedAt)
      expect(a.updatedAt()).to.equal(updatedAt)
      expect(a.modifiedAt()).to.equal(updatedAt)
    })
    it('should default to new Date()', () => {
      const a = new AggregateRoot()
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      a.persisted('42', createdAt)
      a.updated()
      expect(a.updatedAt()).to.be.at.most(new Date())
    })
  })
  describe('.deletedAt()', () => {
    it('should return time of deleting', () => {
      const a = new AggregateRoot()
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const updatedAt = new Date('2016-01-02T03:04:05+00:00')
      const deletedAt = new Date('2016-01-03T03:04:05+00:00')
      a.persisted('42', createdAt)
      a.updated(updatedAt)
      a.deleted(deletedAt)
      expect(a.deletedAt()).to.equal(deletedAt)
      expect(a.modifiedAt()).to.equal(deletedAt)
    })
    it('should default to new Date()', () => {
      const a = new AggregateRoot()
      const createdAt = new Date('2016-01-01T03:04:05+00:00')
      const updatedAt = new Date('2016-01-02T03:04:05+00:00')
      a.persisted('42', createdAt)
      a.updated(updatedAt)
      a.deleted()
      expect(a.deletedAt()).to.be.at.most(new Date())
    })
  })
  describe('.modifiedAt()', () => {
    it('should return the last modified date if it has no creation date (legacy)', () => {
      const a = new AggregateRoot()
      a.persisted('42')
      const updatedAt = new Date('2016-01-02T03:04:05+00:00')
      a.updated(updatedAt)
      expect(a.modifiedAt()).to.equal(updatedAt)
    })
  })
  describe('.createdBy()', () => {
    it('should return if of the creator', () => {
      const a = new AggregateRoot()
      a.persisted('42', undefined, '17')
      expect(a.createdBy()).to.equal('17')
    })
    it('should default to undefined', () => {
      const a = new AggregateRoot()
      a.persisted('42')
      expect(a.createdBy()).to.equal(undefined)
    })
  })
  describe('.is()', () => {
    it('should return true, if AggregateRoot is passed', () => {
      expect(AggregateRoot.is(new AggregateRoot())).to.equal(true)
    })
    it('should return true, if a similar object is passed', () => {
      const root = {
        constructor: {name: AggregateRoot.name},
        persisted: () => {},
        updated: () => {},
        deleted: () => {},
        aggregateVersion: () => {},
        aggregateId: () => {},
        isDeleted: () => {},
        createdAt: () => {},
        modifiedAt: () => {},
        updatedAt: () => {},
        deletedAt: () => {},
        createdBy: () => {}
      }
      expect(AggregateRoot.is(root)).to.equal(true)
    })
  })
  describe('.applyEvent()', () => {
    it('should throw an exception if not implemented', () => {
      const m = new AggregateRoot()
      expect(() => m.applyEvent(new ModelEvent('17', 'SomeEvent'))).to.throw(/UnhandledDomainEventError/)
    })
  })
})
