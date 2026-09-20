'use strict';

const User = require('./User');

/**
 * A staff member who submits campus service requests.
 * Extends User via constructor chaining (super()).
 */
class StaffRequester extends User {
  #department;

  constructor(userId, firstName, lastName, email, department) {
    super(userId, firstName, lastName, email, 'Staff');
    this.#department = department;
    this.validate();
  }

  getDepartment() { return this.#department; }

  setDepartment(department) {
    if (!department || !String(department).trim()) {
      throw new Error('Department cannot be empty.');
    }
    this.#department = department.trim();
  }

  validate() {
    super.validate();
    if (!this.#department || !String(this.#department).trim()) {
      throw new Error('Department is required for a staff requester.');
    }
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nDepartment: ${this.#department}`;
  }
}

module.exports = StaffRequester;
