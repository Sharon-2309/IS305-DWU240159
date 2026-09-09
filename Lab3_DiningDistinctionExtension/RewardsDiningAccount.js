/*
  Program: Dining Meal Booking Feature - Lab 3 (Distinction Extension)
  Student Name: SharonPETER
  Student ID: 240159
  Date: 8 September 2026
  Description: RewardsDiningAccount extends DiningAccount. It earns a
  bonus credit based on the current balance and an account-specific
  reward rate.
*/

'use strict';

const DiningAccount = require('./DiningAccount');

class RewardsDiningAccount extends DiningAccount {
  #rewardRate;

  /**
   * Chains to DiningAccount's constructor with super() to initialise
   * the account number and opening balance, then sets up the reward
   * rate that is specific to this subclass.
   */
  constructor(accountNumber, openingBalance, rewardRate) {
    super(accountNumber, openingBalance);
    if (typeof rewardRate !== 'number' || Number.isNaN(rewardRate) || rewardRate < 0) {
      throw new Error('Reward rate cannot be negative.');
    }
    this.#rewardRate = rewardRate;
  }

  get rewardRate() { return this.#rewardRate; }

  /** Reward = current balance x reward rate / 100. */
  calculateReward() {
    return (this.getBalance() * this.#rewardRate) / 100;
  }

  /** Adds the calculated reward to the account and records the transaction. */
  applyReward() {
    const reward = this.calculateReward();
    this._adjustBalance(reward);
    this._recordTransaction('Reward', reward, `Reward at ${this.#rewardRate}%`);
    return reward;
  }

  /** Overridden to also show the reward rate. */
  displayAccountSummary() {
    return [
      '========================================',
      `Account Number: ${this.accountNumber}`,
      `Account Type: ${this.accountType}`,
      `Current Balance: K${this.getBalance().toFixed(2)}`,
      `Reward Rate: ${this.#rewardRate}%`,
      '========================================',
    ].join('\n');
  }
}

module.exports = RewardsDiningAccount;
