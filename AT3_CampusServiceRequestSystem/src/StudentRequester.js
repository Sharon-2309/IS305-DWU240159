'use strict';

const User = require('./User');

/**
 * A student who submits campus service requests.
 * Extends User via constructor chaining (super()).
 */
class StudentRequester extends User {
  #programme;
  #yearLevel;

  constructor(userId, firstName, lastName, email, programme, yearLevel) {
    super(userId, firstName, lastName, email, 'Student');
    this.#programme = programme;
    this.#yearLevel = yearLevel;

    // Safe to validate now — super() has returned, so both User's fields
    // and this subclass's own fields (#programme, #yearLevel) exist.
    this.validate();
  }

  getProgramme() { return this.#programme; }
  getYearLevel() { return this.#yearLevel; }

  setProgramme(programme) {
    if (!programme || !String(programme).trim()) {
      throw new Error('Programme cannot be empty.');
    }
    this.#programme = programme.trim();
  }

  setYearLevel(yearLevel) {
    if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 6) {
      throw new Error('Year level must be a whole number between 1 and 6.');
    }
    this.#yearLevel = yearLevel;
  }

  validate() {
    super.validate();
    if (!this.#programme || !String(this.#programme).trim()) {
      throw new Error('Programme is required for a student requester.');
    }
    if (!Number.isInteger(this.#yearLevel) || this.#yearLevel < 1 || this.#yearLevel > 6) {
      throw new Error('Year level must be a whole number between 1 and 6.');
    }
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nProgramme: ${this.#programme}\nYear Level: ${this.#yearLevel}`;
  }
}

module.exports = StudentRequester;
