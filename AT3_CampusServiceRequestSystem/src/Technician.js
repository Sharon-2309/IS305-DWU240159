'use strict';

const User = require('./User');

/**
 * Carries out assigned work: begins work, records progress, resolves
 * requests. Extends User via constructor chaining (super()).
 */
class Technician extends User {
  #technicalSpeciality;

  constructor(userId, firstName, lastName, email, technicalSpeciality) {
    super(userId, firstName, lastName, email, 'Technician');
    this.#technicalSpeciality = technicalSpeciality;
    this.validate();
  }

  getTechnicalSpeciality() { return this.#technicalSpeciality; }

  setTechnicalSpeciality(technicalSpeciality) {
    if (!technicalSpeciality || !String(technicalSpeciality).trim()) {
      throw new Error('Technical speciality cannot be empty.');
    }
    this.#technicalSpeciality = technicalSpeciality.trim();
  }

  validate() {
    super.validate();
    if (!this.#technicalSpeciality || !String(this.#technicalSpeciality).trim()) {
      throw new Error('Technical speciality is required for a Technician.');
    }
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nTechnical Speciality: ${this.#technicalSpeciality}`;
  }
}

module.exports = Technician;
