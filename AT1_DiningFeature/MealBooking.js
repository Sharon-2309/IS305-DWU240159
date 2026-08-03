/*
  Program: Dining Meal Booking Feature
  Student Name: Sharon PETER
  Student ID: 240159
  Date: 02 August 2026
  Description: A JavaScript program demonstrating classes, objects,
  constructors, private fields and methods for the DWU Dining Services
  meal booking system.
*/

'use strict';

// Price list used by calculateTotal(). Kept here so both files can
// reference the same source of truth for meal prices (in Kina).
const MEAL_PRICES = {
  Breakfast: 10,
  Lunch: 15,
  Dinner: 20,
};

class MealBooking {
  // Private fields — protect the internal state of a booking.
  #studentId;
  #studentName;
  #mealDate;
  #mealType;
  #quantity;
  #dietaryNote;
  #bookingStatus;

  /**
   * Creates a new MealBooking.
   * @param {{studentId:string, studentName:string, mealDate:string,
   *          mealType:string, quantity:number, dietaryNote:string}} data
   */
  constructor({ studentId, studentName, mealDate, mealType, quantity, dietaryNote }) {
    this.#studentId = studentId;
    this.#studentName = studentName;
    this.#mealDate = mealDate;
    this.#mealType = mealType;
    this.#quantity = quantity;
    this.#dietaryNote = dietaryNote;
    // New bookings always start out Pending.
    this.#bookingStatus = 'Pending';
  }

  // ---------- Getters ----------
  get studentId() { return this.#studentId; }
  get studentName() { return this.#studentName; }
  get mealDate() { return this.#mealDate; }
  get mealType() { return this.#mealType; }
  get quantity() { return this.#quantity; }
  get dietaryNote() { return this.#dietaryNote; }
  get bookingStatus() { return this.#bookingStatus; }

  // ---------- Setters ----------
  set studentName(name) { this.#studentName = name; }
  set quantity(qty) { this.#quantity = qty; }
  set dietaryNote(note) { this.#dietaryNote = note; }
  set bookingStatus(status) { this.#bookingStatus = status; }

  /**
   * Rejects missing or invalid booking information.
   * @returns {{valid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    if (!this.#studentId || String(this.#studentId).trim() === '') {
      errors.push('Student ID is required.');
    }
    if (!this.#studentName || String(this.#studentName).trim() === '') {
      errors.push('Student name is required.');
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
   * Returns a clear, formatted booking receipt.
   */
  getSummary() {
    const total = this.calculateTotal();
    return [
      '========================================',
      '            BOOKING RECEIPT',
      '========================================',
      `Student: ${this.#studentName} (${this.#studentId})`,
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
