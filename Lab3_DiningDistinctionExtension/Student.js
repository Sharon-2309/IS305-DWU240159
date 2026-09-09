/*
  Program: Dining Meal Booking Feature - Lab 3 (Distinction Extension)
  Student Name: SharonPETER
  Student ID: 240159
  Date: 8 September 2026
  Description: Defines the Student class. A Student object stores a
  student's identity (ID, first name, last name) separately from their
  meal bookings, so the same Student object can be shared by several
  MealBooking objects. Extended in Lab 3 so a student can also be
  assigned one dining account (a DiningAccount, or a RewardsDiningAccount
  / CreditDiningAccount subclass) used to pay for their bookings.
*/

'use strict';

const DiningAccount = require('./DiningAccount');

class Student {
  // Private fields — protect the student's identity data.
  #studentId;
  #firstName;
  #lastName;
  #diningAccount = null;

  /**
   * Creates a new Student. Uses the public setters (via `this`) so the
   * same validation rules apply whether a field is set here or later.
   */
  constructor(studentId, firstName, lastName) {
    this.studentId = studentId;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  // ---------- Accessors ----------
  get studentId() { return this.#studentId; }
  set studentId(id) {
    if (!id || String(id).trim() === '') {
      throw new Error('Student ID cannot be empty.');
    }
    this.#studentId = String(id).trim();
  }

  get firstName() { return this.#firstName; }
  set firstName(name) {
    if (!name || String(name).trim() === '') {
      throw new Error('First name cannot be empty.');
    }
    this.#firstName = String(name).trim();
  }

  get lastName() { return this.#lastName; }
  set lastName(name) {
    if (!name || String(name).trim() === '') {
      throw new Error('Last name cannot be empty.');
    }
    this.#lastName = String(name).trim();
  }

  /**
   * Returns the student's first and last name as one value.
   */
  getFullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  /**
   * Assigns a dining account to this student. Accepts a DiningAccount
   * object or an instance of any of its subclasses (RewardsDiningAccount,
   * CreditDiningAccount) — `instanceof` follows the prototype chain, so
   * subclass instances pass this check too.
   */
  assignDiningAccount(account) {
    if (!(account instanceof DiningAccount)) {
      throw new Error('A valid DiningAccount (or subclass) object is required.');
    }
    this.#diningAccount = account;
  }

  /** Returns the student's assigned dining account, or null if none. */
  getDiningAccount() {
    return this.#diningAccount;
  }

  /**
   * Displays/returns the student ID and full name clearly.
   */
  displayInfo() {
    return [
      '========================================',
      '            STUDENT DETAILS',
      '========================================',
      `Student ID: ${this.#studentId}`,
      `Student Name: ${this.getFullName()}`,
      '========================================',
    ].join('\n');
  }
}

module.exports = Student;
