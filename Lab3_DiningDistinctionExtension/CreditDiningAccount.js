/*
  Program: Dining Meal Booking Feature - Lab 3 (Distinction Extension)
  Student Name: SharonPETER
  Student ID: 240159
  Date: 8 September 2026
  Description: CreditDiningAccount extends DiningAccount. It allows the
  balance to fall below zero, but never past an approved credit limit.
  It overrides payForMeal() to apply this controlled-credit rule instead
  of the base class's strict sufficient-funds check.
*/

'use strict';

const DiningAccount = require('./DiningAccount');

class CreditDiningAccount extends DiningAccount {
  #creditLimit;

  /**
   * Chains to DiningAccount's constructor with super() to initialise
   * the account number and opening balance, then validates and stores
   * the credit limit specific to this subclass.
   */
  constructor(accountNumber, openingBalance, creditLimit) {
    super(accountNumber, openingBalance);
    if (typeof creditLimit !== 'number' || Number.isNaN(creditLimit) || creditLimit < 0) {
      throw new Error('Credit limit cannot be negative.');
    }
    this.#creditLimit = creditLimit;
  }

  get creditLimit() { return this.#creditLimit; }

  /**
   * Overrides the base payForMeal(): the balance may fall below zero,
   * but never below the negative of the approved credit limit.
   * Example: K1,000 balance, K500 credit limit -> a K1,500 payment is
   * accepted (resulting balance K-500); anything beyond that is rejected.
   */
  payForMeal(amount, description = 'Meal payment') {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('A payment amount must be greater than zero.');
    }

    const resultingBalance = this.getBalance() - amount;
    const minimumAllowedBalance = -this.#creditLimit;

    if (resultingBalance < minimumAllowedBalance) {
      return {
        success: false,
        message: `Payment rejected: exceeds approved credit limit of K${this.#creditLimit.toFixed(2)}.`,
      };
    }

    this._adjustBalance(-amount);
    this._recordTransaction('Meal Payment', amount, description);
    return { success: true, message: 'Payment successful.' };
  }

  /** Overridden to also show the credit limit. */
  displayAccountSummary() {
    return [
      '========================================',
      `Account Number: ${this.accountNumber}`,
      `Account Type: ${this.accountType}`,
      `Current Balance: K${this.getBalance().toFixed(2)}`,
      `Credit Limit: K${this.#creditLimit.toFixed(2)}`,
      '========================================',
    ].join('\n');
  }
}

module.exports = CreditDiningAccount;
