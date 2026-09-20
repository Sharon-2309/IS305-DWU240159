'use strict';

const User = require('./User');

/**
 * Reviews requests, sets priority, assigns Technicians, and verifies and
 * closes resolved work. Extends User via constructor chaining (super()).
 */
class ServiceOfficer extends User {
  #serviceSection;

  constructor(userId, firstName, lastName, email, serviceSection) {
    super(userId, firstName, lastName, email, 'ServiceOfficer');
    this.#serviceSection = serviceSection;
    this.validate();
  }

  getServiceSection() { return this.#serviceSection; }

  setServiceSection(serviceSection) {
    if (!serviceSection || !String(serviceSection).trim()) {
      throw new Error('Service section cannot be empty.');
    }
    this.#serviceSection = serviceSection.trim();
  }

  validate() {
    super.validate();
    if (!this.#serviceSection || !String(this.#serviceSection).trim()) {
      throw new Error('Service section is required for a Service Officer.');
    }
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nService Section: ${this.#serviceSection}`;
  }
}

module.exports = ServiceOfficer;
