'use strict';

/**
 * Represents a user of the Campus Service Request Management System.
 *
 * At Pass Level this single class covers all four roles (Student/Staff
 * Requester, Service Officer, Technician, Administrator) via the userType
 * field. Role-specific subclasses (StudentRequester, StaffRequester,
 * ServiceOfficer, Technician) are introduced through inheritance at the
 * Credit level (Week 11) using super().
 */
class User {
  #userId;
  #firstName;
  #lastName;
  #email;
  #userType;

  static VALID_USER_TYPES = [
    'Student',
    'Staff',
    'ServiceOfficer',
    'Technician',
    'Administrator',
  ];

  constructor(userId, firstName, lastName, email, userType) {
    this.#userId = userId;
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#email = email;
    this.#userType = userType;

    // Fail fast: an invalid user should never be constructable.
    // NOTE: we call the private #validateOwnFields() here, NOT the public
    // (overridable) validate(). If a subclass constructor calls super(...),
    // this runs before the subclass's own private fields exist yet — calling
    // an overridden validate() at that point would try to read fields that
    // haven't been initialised and throw. Subclasses validate themselves
    // explicitly, at the end of their own constructor, once all fields exist.
    this.#validateOwnFields();
  }

  // ---------- Getters ----------
  getUserId() { return this.#userId; }
  getFirstName() { return this.#firstName; }
  getLastName() { return this.#lastName; }
  getEmail() { return this.#email; }
  getUserType() { return this.#userType; }

  // ---------- Controlled setters ----------
  // userId and userType are intentionally NOT settable after construction —
  // a user's identity and role should not silently change once created.

  setFirstName(firstName) {
    if (!firstName || !String(firstName).trim()) {
      throw new Error('First name cannot be empty.');
    }
    this.#firstName = firstName.trim();
  }

  setLastName(lastName) {
    if (!lastName || !String(lastName).trim()) {
      throw new Error('Last name cannot be empty.');
    }
    this.#lastName = lastName.trim();
  }

  setEmail(email) {
    if (!User.isValidEmail(email)) {
      throw new Error(`Invalid email address: "${email}".`);
    }
    this.#email = email.trim();
  }

  // ---------- Behaviour ----------
  getFullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  /**
   * Validates all base User fields. Private and NOT overridable — always
   * checks exactly the fields declared on User, regardless of which
   * subclass instance calls it. Safe to call from the constructor.
   */
  #validateOwnFields() {
    if (!this.#userId || !String(this.#userId).trim()) {
      throw new Error('User ID is required.');
    }
    if (!this.#firstName || !String(this.#firstName).trim()) {
      throw new Error('First name is required.');
    }
    if (!this.#lastName || !String(this.#lastName).trim()) {
      throw new Error('Last name is required.');
    }
    if (!User.isValidEmail(this.#email)) {
      throw new Error(`Invalid email address: "${this.#email}".`);
    }
    if (!this.#userType || !User.VALID_USER_TYPES.includes(this.#userType)) {
      throw new Error(
        `Unsupported user type: "${this.#userType}". ` +
        `Must be one of: ${User.VALID_USER_TYPES.join(', ')}.`
      );
    }
    return true;
  }

  /**
   * Public, overridable validation entry point. Subclasses override this
   * to call super.validate() plus their own specialised field checks, and
   * call it themselves explicitly at the end of their own constructor.
   */
  validate() {
    return this.#validateOwnFields();
  }

  displayInfo() {
    return (
      `User ID: ${this.#userId}\n` +
      `Name: ${this.getFullName()}\n` +
      `Email: ${this.#email}\n` +
      `Type: ${this.#userType}`
    );
  }

  /**
   * Practical email validation: local-part@domain.tld
   * (Not a full RFC 5322 implementation — sufficient for this assignment's
   * validation requirements.)
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email.trim());
  }
}

module.exports = User;
