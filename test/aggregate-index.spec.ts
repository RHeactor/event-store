/* global describe, it, before */

import {AggregateIndex} from '../src/aggregate-index'
import helper from './helper'
import {expect} from 'chai'
import {EntryAlreadyExistsError} from '@resourcefulhumans/rheactor-errors'

describe('AggregateIndex', () => {
  before(helper.clearDb)

  let aggregateIndex

  before(() => {
    aggregateIndex = new AggregateIndex('user', helper.redis)
  })

  describe('.add()', () => {
    it('should add and overwrite indices for the same value', async () => {
      Promise
        .all([
          aggregateIndex.add('email', 'john.doe@example.invalid', '17'),
          aggregateIndex.add('email', 'jane.doe@example.invalid', '18')
        ])
      const res = await aggregateIndex.find('email', 'jane.doe@example.invalid')
      expect(res).to.equal('18')
    })
  })

  describe('.getAll()', () => {
    it('should return all entries', async () => {
      const res = await aggregateIndex
        .getAll('email')

      expect(res).to.deep.equal(['17', '18'])
    })
  })

  describe('.remove()', () => {
    it('should remove a value from an index', async () => {
      await aggregateIndex.add('some-type', 'some-value', 'some-aggregateId')
      await aggregateIndex.remove('some-type', 'some-value', 'some-aggregateId')
      const res = await aggregateIndex.find('some-type', 'some-value')
      expect(res).to.equal(null)
    })
  })

  describe('.addIfNotPresent()', () => {
    it('should only add and index for a value if it is not present', async () => {
      try {
        await Promise
          .all([
            aggregateIndex.addIfNotPresent('email', 'jill.doe@example.invalid', '17'),
            aggregateIndex.addIfNotPresent('email', 'jill.doe@example.invalid', '18')
          ])
      } catch (err) {
        expect(err.message).to.be.contain('jill.doe@example.invalid')
      }
    })
  })

  describe('.addToListIfNotPresent()', () => {
    it('should add a value to the list if it is not present', () => {
      return aggregateIndex.addToListIfNotPresent('meeting-users:42', '17')
    })
    it('should not add the value to the list if it is present', async () => {
      try {
        await aggregateIndex.addToListIfNotPresent('meeting-users:42', '17')
      } catch (err) {
        expect(EntryAlreadyExistsError.is(err)).to.equal(true)
        expect(err.message).to.equal('Aggregate "17" already member of "user.meeting-users:42.list".')
      }
    })
  })

  describe('.getList()', () => {
    it('should add a value to the list if it is not present', async () => {
      await Promise
        .all([
          aggregateIndex.addToListIfNotPresent('meeting-users:256', '19'),
          aggregateIndex.addToListIfNotPresent('meeting-users:256', '20')
        ])
      const [id1, id2] = await aggregateIndex.getList('meeting-users:256')
      expect(id1).to.equal('19')
      expect(id2).to.equal('20')
    })
  })

  describe('.removeFromList()', () => {
    it('should add a value to the list if it is not present', async () => {
      await aggregateIndex.addToListIfNotPresent('meeting-users:127', '18')
      const [id] = await aggregateIndex.getList('meeting-users:127')
      expect(id).to.equal('18')

      await aggregateIndex.removeFromList('meeting-users:127', '18')
      const members = await aggregateIndex.getList('meeting-users:127')
      expect(members).to.deep.equal([])
    })
  })
})
