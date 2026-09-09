# Lab 3 – Dining Account Distinction Extension

**Student name:** _SharonPETER_
**Student ID:** _240159_
**GitHub repository URL:** _https://github.com/Sharon-2309/IS305-DWU240159_ 

## How Lab 3 extends Labs 1 and 2

Lab 1 built the `MealBooking` class and console app. Lab 2 introduced a
separate `Student` class so a student's identity could be shared across
several bookings. Lab 3 adds a simulated **dining account** so a student
can actually pay for their bookings.

Nothing from Labs 1–2 was replaced: `Student.js` and `MealBooking.js` were
extended in place, and `DiningApp.js` keeps all of its Lab 1/2 menu options
(add booking, view bookings, confirm/cancel, booking history, update
student name) alongside the new account features.

## Class inheritance hierarchy

```
DiningAccount (base class)
 ├─ #accountNumber, #balance, #transactions
 ├─ deposit(), payForMeal(), getBalance(), getTransactions(),
 │  displayAccountSummary()
 │
 ├─ RewardsDiningAccount extends DiningAccount
 │   ├─ #rewardRate
 │   └─ calculateReward(), applyReward()
 │       (displayAccountSummary() overridden to add the reward rate)
 │
 └─ CreditDiningAccount extends DiningAccount
     ├─ #creditLimit
     └─ payForMeal() OVERRIDDEN — allows the balance to fall below
        zero, but never below −creditLimit
        (displayAccountSummary() overridden to add the credit limit)
```

Both subclasses call `super(accountNumber, openingBalance)` in their
constructor before setting up their own field — this is **constructor
chaining**: the base class is always responsible for validating and
initialising the account number and balance, and the subclass only adds
what's specific to it.

## Method overriding and polymorphism

`CreditDiningAccount` overrides `payForMeal()` with its own controlled-credit
rule instead of the base class's strict "balance must cover the payment"
rule. `MealBooking.processPayment(diningAccount)` never checks what kind of
account it was given — it always calls `diningAccount.payForMeal(...)`, and
JavaScript resolves that call to whichever class's version actually applies
at runtime. This is polymorphism: the same line of code produces different,
correct behaviour depending on the real object.

The app also demonstrates this directly — menu option 10 loops over every
account with `for (const account of accounts) { account.displayAccountSummary(); }`,
and each account prints its own specialised summary through the same call.

## Simulated overloading

JavaScript doesn't support two methods/constructors with the same name and
different parameter lists. Instead:
- `DiningAccount`'s constructor uses a **default parameter**:
  `constructor(accountNumber, openingBalance = 0)`, so
  `new DiningAccount("DA001")` and `new DiningAccount("DA002", 1000)` both
  work with one constructor definition.
- `deposit(amount, description = 'Deposit')` and
  `payForMeal(amount, description = 'Meal payment')` work the same way —
  `account.deposit(500)` and `account.deposit(500, "Weekly meal allowance")`
  both call the same method.

This gives the *effect* of overloading (the same call can be made with one
or two arguments) using default parameters rather than multiple method
declarations.

## How Student, MealBooking and DiningAccount are connected

- `Student.js` adds a private `#diningAccount` field, an
  `assignDiningAccount(account)` method that only accepts a `DiningAccount`
  (or subclass — checked with `instanceof`, which follows the prototype
  chain), and a `getDiningAccount()` getter.
- `MealBooking.js` adds `processPayment(diningAccount)`. It calculates the
  booking total, calls `diningAccount.payForMeal(total, description)`, and:
  - on success — marks the booking as paid and calls `confirmBooking()`
  - on failure — leaves the booking `Pending` and returns the rejection
    message
  - if already paid/confirmed/cancelled — rejects immediately, so a booking
    can never be charged twice.

## Files

| File | Purpose |
|---|---|
| `DiningAccount.js` | Base class: balance, transaction history, `deposit()`, `payForMeal()`, `getBalance()`, `getTransactions()`, `displayAccountSummary()`. |
| `RewardsDiningAccount.js` | Extends `DiningAccount`. Adds `#rewardRate`, `calculateReward()`, `applyReward()`. |
| `CreditDiningAccount.js` | Extends `DiningAccount`. Adds `#creditLimit`. Overrides `payForMeal()` to allow controlled negative balances. |
| `Student.js` | From Lab 2, extended with `assignDiningAccount()` / `getDiningAccount()`. |
| `MealBooking.js` | From Lab 2, extended with `processPayment(diningAccount)`. |
| `DiningApp.js` | Console application tying everything together (see menu below). |
| `README.md` | This file. |

## How to run

```
node DiningApp.js
```

No extra packages needed — only Node's built-in `readline` module.

## Menu options

1. Add booking
2. View all bookings
3. Confirm a booking (manual override)
4. Cancel a booking (manual override)
5. View student booking history
6. Update student name
7. Create a dining account for a student (Standard / Rewards / Credit)
8. Deposit into a dining account
9. Pay for a booking using a dining account
10. View all dining accounts (polymorphic display)
11. View an account's transaction history
12. **Run required Lab 3 demonstrations** — runs every scenario from the
    brief automatically in one pass (see below)
13. Exit

## Tests completed

All run and verified, including via menu option 12 which reproduces every
required scenario in one deterministic pass:

1. **Standard account payment** – K1,000 opening balance, K500 deposit, K200 meal payment → accepted, final balance K1,300.00.
2. **Insufficient standard balance** – K50 balance, K200 payment attempt → rejected, balance unchanged at K50.00.
3. **Rewards calculation** – K1,500 opening + K500 deposit = K2,000 balance, 2.5% reward rate → reward K50.00 correctly calculated and applied, final balance K2,050.00.
4. **Credit account within limit** – K1,000 balance, K500 credit limit, K1,500 payment → accepted, resulting balance K-500.00.
5. **Credit limit exceeded** – a further K100 payment on the same account → rejected with a clear message, balance unchanged.
6. **Polymorphic account processing** – a `DiningAccount`, `RewardsDiningAccount` and `CreditDiningAccount` stored in one array; the same `displayAccountSummary()` call on each produced the correct, type-specific output.
7. **Booking payment** – a confirmed `MealBooking` paid successfully through its assigned account; booking status changed from Pending to Confirmed.
8. **Duplicate payment** – a second `processPayment()` call on the same booking was correctly rejected ("This booking has already been paid for.").
9. **Transaction history** – deposits, meal payments and rewards are all recorded with type, amount, description, date/time and running balance, and displayed correctly (manually verified via menu option 11, also using a real credit account: 3 transactions — opening deposit, meal payment, top-up deposit — with correct running balances).
10. **Simulated constructor/method overloading** – `new DiningAccount("DA004")` vs `new DiningAccount("DA005", 500)`, and `account.deposit(100)` vs `account.deposit(100, "Additional meal funds")`, both demonstrated working from the same constructor/method definition.

## AI tool use

Portions of this code were developed with the assistance of Claude
(Anthropic AI). The requirements, class design and testing approach were
reviewed and understood by the student before submission.
