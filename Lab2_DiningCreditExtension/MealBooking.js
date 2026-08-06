/*
  Program: Dining Meal Booking Feature - Lab 2 (Credit Extension)
  Student Name: Sharon PETER
  Student ID: 240159
  Date: 6 August 2026
  Description: Defines the MealBooking class. Refactored for Lab 2 so
  that a booking stores a reference to a Student object (#student)
  instead of duplicating the student's ID and name inside every
  booking. Meal date, meal type, quantity, dietary note, booking status
  and cost calculation continue to work exactly as in Lab 1.
*/

'use strict';

const Student = require('./Student');

// Price list used by calculateTotal() (in Kina).
const MEAL_PRICES = {
  Breakfast: 10,
  Lunch: 15,
  Dinner: 20,
};

class MealBooking {
  // Private fields — protect the internal state of a booking.
  #student;
  #mealDate;
  #mealType;
  #quantity;
  #dietaryNote;
  #bookingStatus;

  /**
   * Creates a new MealBooking connected to a Student object.
   * @param {{student:Student, mealDate:string, mealType:string,
   *          quantity:number, dietaryNote:string}} data
   */
  constructor({ student, mealDate, mealType, quantity, dietaryNote }) {
    this.#student = student;
    this.#mealDate = mealDate;
    this.#mealType = mealType;
    this.#quantity = quantity;
    this.#dietaryNote = dietaryNote;
    // New bookings always start out Pending.
    this.#bookingStatus = 'Pending';
  }

  // ---------- Getters ----------
  get student() { return this.#student; }
  get studentId() {
    return this.#student instanceof Student ? this.#student.studentId : undefined;
  }
  get mealDate() { return this.#mealDate; }
  get mealType() { return this.#mealType; }
  get quantity() { return this.#quantity; }
  get dietaryNote() { return this.#dietaryNote; }
  get bookingStatus() { return this.#bookingStatus; }

  // ---------- Setters ----------
  set quantity(qty) { this.#quantity = qty; }
  set dietaryNote(note) { this.#dietaryNote = note; }
  set bookingStatus(status) { this.#bookingStatus = status; }

  /**
   * Rejects missing or invalid booking information, including a
   * missing/invalid Student object.
   * @returns {{valid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    if (!(this.#student instanceof Student)) {
      errors.push('A valid Student object is required.');
    }
    if (!this.#mealDate || String(this.#mealDate).trim() === '') {
      errors.push('Meal date is required.');
    }

    const validTypes = Object.keys(MEAL_PRICES);
    if (!validTypes.includes(this.#mealType)) {
      errors.push(`Meal type must be one of: ${validTypes.join(', ')}.`);
    }

    if (!Number.isInteger(this.#quantity) || this.#quantity < 1) {
      errors.push('Quantity must be a whole number of at least 1.');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Returns the selected meal price multiplied by quantity.
   */
  calculateTotal() {
    const price = MEAL_PRICES[this.#mealType];
    if (price === undefined) {
      throw new Error(`Cannot calculate total: unknown meal type "${this.#mealType}".`);
    }
    return price * this.#quantity;
  }

  /**
   * Changes the booking status from Pending to Confirmed.
   */
  confirmBooking() {
    if (this.#bookingStatus !== 'Pending') {
      throw new Error(`Cannot confirm a booking with status "${this.#bookingStatus}".`);
    }
    this.#bookingStatus = 'Confirmed';
    return this.#bookingStatus;
  }

  /**
   * Changes the booking status to Cancelled.
   */
  cancelBooking() {
    this.#bookingStatus = 'Cancelled';
    return this.#bookingStatus;
  }

  /**
   * Returns a clear, formatted booking receipt. Reads the student's
   * name/ID live from the connected Student object, so an updated
   * student name is reflected automatically.
   */
  getSummary() {
    const total = this.calculateTotal();
    const studentLine =
      this.#student instanceof Student
        ? `${this.#student.getFullName()} (${this.#student.studentId})`
        : 'Unknown student';

    return [
      '========================================',
      '            BOOKING RECEIPT',
      '========================================',
      `Student: ${studentLine}`,
      `Meal: ${this.#mealType} x ${this.#quantity}`,
      `Date: ${this.#mealDate}`,
      `Dietary note: ${this.#dietaryNote || 'None'}`,
      `Status: ${this.#bookingStatus}`,
      `Total cost: K${total.toFixed(2)}`,
      '========================================',
    ].join('\n');
  }
}

module.exports = MealBooking;
module.exports.MEAL_PRICES = MEAL_PRICES;
