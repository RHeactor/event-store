'use strict'

const util = require('util')
const AggregateRoot = require('../aggregate-root')
const UnhandledDomainEvent = require('rheactor-value-objects/errors/unhandled-domain-event')

function DummyModel (email) {
  AggregateRoot.call(this)
  this.email = email
}
util.inherits(DummyModel, AggregateRoot)

/**
 * @param {ModelEvent} event
 * @return {ModelEvent} event
 */
DummyModel.prototype.applyEvent = function (event) {
  switch (event.name) {
    case 'DummyCreatedEvent':
      this.email = event.data.email
      this.persisted(event.aggregateId, event.createdAt)
      break
    case 'DummyDeletedEvent':
      this.deleted(event.createdAt)
      break
    default:
      throw new UnhandledDomainEvent(event.name)
  }
}

module.exports = DummyModel
