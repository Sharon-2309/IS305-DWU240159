'use strict';

const StudentRequester = require('./StudentRequester');
const StaffRequester = require('./StaffRequester');
const ServiceOfficer = require('./ServiceOfficer');
const Technician = require('./Technician');
const User = require('./User');

/**
 * Recreates the correct role-specific User object from plain data loaded
 * out of users.json. Mirrors ServiceRequestFactory — JSON has no concept
 * of classes, so this is what restores real, behaviour-bearing User
 * objects (with a working validate(), displayInfo(), etc.) after restart.
 */
class UserFactory {
  /**
   * @param {object} savedData - a plain object as stored in users.json
   * @returns {User} the correct subclass instance
   */
  static createFromData(savedData) {
    if (!savedData || typeof savedData !== 'object') {
      throw new Error('UserFactory.createFromData() requires a saved data object.');
    }

    const { userId, userType, firstName, lastName, email, specialisedFields = {} } = savedData;

    switch (userType) {
      case 'Student':
        return new StudentRequester(
          userId, firstName, lastName, email,
          specialisedFields.programme, specialisedFields.yearLevel
        );
      case 'Staff':
        return new StaffRequester(userId, firstName, lastName, email, specialisedFields.department);
      case 'ServiceOfficer':
        return new ServiceOfficer(
          userId, firstName, lastName, email, specialisedFields.serviceSection
        );
      case 'Technician':
        return new Technician(
          userId, firstName, lastName, email, specialisedFields.technicalSpeciality
        );
      case 'Administrator':
        // No dedicated subclass — the brief only requires role subclasses
        // for Student/Staff/ServiceOfficer/Technician. An Administrator
        // only reviews records and audits, so plain User is sufficient.
        return new User(userId, firstName, lastName, email, 'Administrator');
      default:
        throw new Error(`UserFactory: unknown userType "${userType}" for user "${userId}".`);
    }
  }
}

module.exports = UserFactory;
