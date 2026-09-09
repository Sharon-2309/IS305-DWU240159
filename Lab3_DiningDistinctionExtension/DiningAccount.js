/*
  Program: Dining Meal Booking Feature - Lab 3 (Distinction Extension)
  Student Name: SharonPETER
  Student ID: 240159
  Date: 8 September 2026
  Description: Defines the DiningAccount base class. A DiningAccount holds
  a simulated balance and a transaction history, and lets a student
  deposit funds and pay for meals when sufficient funds are available.
  RewardsDiningAccount and CreditDiningAccount extend this class.
*/

'use strict';

class DiningAccount {
  // Private fields — protect the internal state of the account.
  #accountNumber;
  #balance;
  #transactions;

  /**
   * Creates a DiningAccount. The optional openingBalance parameter
   * demonstrates simulated constructor overloading:
   *   new DiningAccount("DA001")        -> opening balance defaults to 0
   *   new DiningAccount("DA002", 1000)  -> opening balance supplied
   */
  constructor(accountNumber, openingBalance = 0) {
    if (!accountNumber || String(accountNumber).trim() === '') {
      throw new Error('Account number cannot be empty.');
    }
    if (typeof openingBalance !== 'number' || Number.isNaN(openingBalance) || openingBalance < 0) {
      throw new Error('Opening balance cannot be negative.');
    }

    this.#accountNumber = accountNumber;
    this.#balance = 0;
    this.#transactions = [];

    if (openingBalance > 0) {
      this._adjustBalance(openingBalance);
      this._recordTransaction('Deposit', openingBalance, 'Opening balance');
    }
  }

  // ---------- Getters ----------
  get accountNumber() { return this.#accountNumber; }
  /** Uses the runtime class name so subclasses report their own type. */
  get accountType() { return this.constructor.name; }

  // ---------- Protected-style helpers for subclasses ----------
  // True `#private` fields are only visible inside the class that
  // declares them - a subclass cannot touch #balance or #transactions
  // directly. These methods are the controlled "protected" access point
  // subclasses use instead (a common JavaScript pattern, since JS has no
  // real `protected` keyword).
  _adjustBalance(delta) {
    this.#balance += delta;
  }

  _recordTransaction(type, amount, description) {
    this.#transactions.push({
      type,
      amount,
      description,
      dateTime: new Date(),
      balanceAfter: this.#balance,
    });
  }

  /**
   * Add money to the account and record the transaction. The optional
   * description parameter demonstrates simulated method overloading:
   *   account.deposit(500)
   *   account.deposit(500, "Weekly meal allowance")
   */
  deposit(amount, description = 'Deposit') {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('A deposit amount must be greater than zero.');
    }
    this._adjustBalance(amount);
    this._recordTransaction('Deposit', amount, description);
    return this.getBalance();
  }

  /**
   * Deducts money only when sufficient funds are available. Subclasses
   * (e.g. CreditDiningAccount) override this to allow controlled
   * negative balances instead of a strict sufficient-funds check.
   */
  payForMeal(amount, description = 'Meal payment') {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('A payment amount must be greater than zero.');
    }
    if (amount > this.getBalance()) {
      return {
        success: false,
        message: `Payment rejected: insufficient funds (balance K${this.getBalance().toFixed(2)}, required K${amount.toFixed(2)}).`,
      };
    }
    this._adjustBalance(-amount);
    this._recordTransaction('Meal Payment', amount, description);
    return { success: true, message: 'Payment successful.' };
  }

  /** Returns the current account balance. */
  getBalance() {
    return this.#balance;
  }

  /** Returns a safe copy of the account transaction history. */
  getTransactions() {
    return this.#transactions.map((t) => ({ ...t }));
  }

  /** Displays the account number, account type and current balance. */
  displayAccountSummary() {
    return [
      '========================================',
      `Account Number: ${this.#accountNumber}`,
      `Account Type: ${this.accountType}`,
      `Current Balance: K${this.getBalance().toFixed(2)}`,
      '========================================',
    ].join('\n');
  }
}

module.exports = DiningAccount;
