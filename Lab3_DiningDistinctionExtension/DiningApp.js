/*
  Program: Dining Meal Booking Feature - Lab 3 (Distinction Extension)
  Student Name: SharonPETER
  Student ID: 240159
  Date: 8 September 2026
  Description: Node.js console application for the DWU Dining Services
  meal booking system. Extends the Lab 1/Lab 2 application with a
  simulated dining account hierarchy (DiningAccount, RewardsDiningAccount,
  CreditDiningAccount), lets a student be assigned one dining account,
  and processes meal-booking payments through that account
  polymorphically. A "Run required demonstrations" menu option
  reproduces every scenario described in the Lab 3 brief in one pass.
*/

'use strict';

const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const Student = require('./Student');
const MealBooking = require('./MealBooking');
const DiningAccount = require('./DiningAccount');
const RewardsDiningAccount = require('./RewardsDiningAccount');
const CreditDiningAccount = require('./CreditDiningAccount');

const rl = readline.createInterface({ input, output });

/** All Student objects created this session, keyed by studentId. */
/** @type {Student[]} */
const students = [];

/** All bookings created this session, stored in memory only. */
/** @type {MealBooking[]} */
const bookings = [];

/** All dining accounts created this session (base + subclass objects). */
/** @type {DiningAccount[]} */
const accounts = [];

function findStudent(studentId) {
  return students.find((s) => s.studentId === studentId);
}

function findAccount(accountNumber) {
  return accounts.find((a) => a.accountNumber === accountNumber);
}

/**
 * Prevents a duplicate booking where the same student ID, meal date
 * and meal type already exist in the array.
 */
function isDuplicateBooking(studentId, mealDate, mealType) {
  return bookings.some(
    (b) => b.studentId === studentId && b.mealDate === mealDate && b.mealType === mealType
  );
}

/**
 * Finds all bookings belonging to a student, displays the student's
 * details once, lists every booking, and shows the total count and
 * combined cost.
 */
function displayBookingHistory(student, allBookings) {
  const studentBookings = allBookings.filter(
    (b) => b.student instanceof Student && b.student.studentId === student.studentId
  );

  console.log('\n' + student.displayInfo());
  console.log('\n----------------------------------------');
  console.log('           BOOKING HISTORY');
  console.log('----------------------------------------');

  if (studentBookings.length === 0) {
    console.log('No bookings found for this student.');
    return;
  }

  let combinedCost = 0;
  studentBookings.forEach((b, i) => {
    const cost = b.calculateTotal();
    combinedCost += cost;
    console.log(`\n${i + 1}. ${b.mealType} - ${b.mealDate}`);
    console.log(`   Quantity: ${b.quantity}`);
    console.log(`   Status: ${b.bookingStatus}`);
    console.log(`   Cost: K${cost.toFixed(2)}`);
  });

  console.log(`\nTotal Bookings: ${studentBookings.length}`);
  console.log(`Combined Cost: K${combinedCost.toFixed(2)}`);
}

/**
 * Collects a student ID and reuses the matching Student object if one
 * already exists, otherwise collects a first/last name and creates a
 * new Student.
 */
async function getOrCreateStudent() {
  const studentId = (await rl.question('Student ID: ')).trim();
  const existing = findStudent(studentId);

  if (existing) {
    console.log(`Existing student found: ${existing.getFullName()}`);
    return existing;
  }

  const firstName = (await rl.question('First name: ')).trim();
  const lastName = (await rl.question('Last name: ')).trim();

  const student = new Student(studentId, firstName, lastName); // may throw
  students.push(student);
  return student;
}

async function addBooking() {
  console.log('\n--- New Meal Booking ---');

  let student;
  try {
    student = await getOrCreateStudent();
  } catch (err) {
    console.log(`\n[REJECTED] Invalid student information: ${err.message}`);
    return;
  }

  const mealDate = (await rl.question('Meal date (YYYY-MM-DD): ')).trim();
  const mealType = (await rl.question('Meal type (Breakfast/Lunch/Dinner): ')).trim();
  const quantityRaw = (await rl.question('Quantity: ')).trim();
  const dietaryNote = (await rl.question('Dietary note (optional): ')).trim();
  const quantity = Number.parseInt(quantityRaw, 10);

  if (isDuplicateBooking(student.studentId, mealDate, mealType)) {
    console.log('\n[REJECTED] A booking already exists for this student, date and meal type.');
    return;
  }

  const booking = new MealBooking({ student, mealDate, mealType, quantity, dietaryNote });

  const { valid, errors } = booking.validate();
  if (!valid) {
    console.log('\n[REJECTED] Booking could not be created:');
    errors.forEach((e) => console.log(` - ${e}`));
    return;
  }

  bookings.push(booking);
  console.log('\n[BOOKING CREATED]');
  console.log(student.displayInfo());
  console.log(booking.getSummary());
}

function listBookings() {
  console.log('\n--- All Bookings ---');
  if (bookings.length === 0) {
    console.log('No bookings yet.');
    return;
  }
  bookings.forEach((b, i) => {
    console.log(`\n#${i + 1}`);
    console.log(b.getSummary());
  });
}

async function confirmOrCancel(action) {
  if (bookings.length === 0) {
    console.log('\nNo bookings to update.');
    return;
  }
  listBookings();
  const idxRaw = await rl.question(`\nEnter booking number to ${action}: `);
  const idx = Number.parseInt(idxRaw, 10) - 1;
  const booking = bookings[idx];

  if (!booking) {
    console.log('\n[ERROR] Invalid booking number.');
    return;
  }

  try {
    if (action === 'confirm') {
      booking.confirmBooking();
    } else {
      booking.cancelBooking();
    }
    console.log(`\n[OK] Booking status updated to "${booking.bookingStatus}".`);
  } catch (err) {
    // Error handling so the program shows a clear message instead of crashing.
    console.log(`\n[ERROR] ${err.message}`);
  }
}

async function viewBookingHistory() {
  if (students.length === 0) {
    console.log('\nNo students yet.');
    return;
  }
  const studentId = (await rl.question('\nEnter Student ID: ')).trim();
  const student = findStudent(studentId);
  if (!student) {
    console.log('\n[ERROR] No student found with that ID.');
    return;
  }
  displayBookingHistory(student, bookings);
}

async function updateStudentName() {
  if (students.length === 0) {
    console.log('\nNo students yet.');
    return;
  }
  const studentId = (await rl.question('\nEnter Student ID to update: ')).trim();
  const student = findStudent(studentId);
  if (!student) {
    console.log('\n[ERROR] No student found with that ID.');
    return;
  }

  console.log(`Current name: ${student.getFullName()}`);
  const newFirst = (await rl.question('New first name (leave blank to keep current): ')).trim();
  const newLast = (await rl.question('New last name (leave blank to keep current): ')).trim();

  try {
    if (newFirst) student.firstName = newFirst;
    if (newLast) student.lastName = newLast;
    console.log(`\n[OK] Student name updated to: ${student.getFullName()}`);
    console.log("This student's existing bookings now show the updated name too, since they reference the same Student object.");
  } catch (err) {
    console.log(`\n[ERROR] ${err.message}`);
  }
}

/**
 * Creates a DiningAccount, RewardsDiningAccount or CreditDiningAccount
 * and assigns it to a student (Task 3: connecting an account to a
 * Student). Reuses getOrCreateStudent() so the account can be attached
 * to a brand-new or an already-existing student.
 */
async function createDiningAccount() {
  console.log('\n--- Create Dining Account ---');

  let student;
  try {
    student = await getOrCreateStudent();
  } catch (err) {
    console.log(`\n[REJECTED] Invalid student information: ${err.message}`);
    return;
  }

  if (student.getDiningAccount()) {
    console.log(
      `\n[INFO] ${student.getFullName()} already has an account (${student.getDiningAccount().accountNumber}). This app supports one account per student.`
    );
    return;
  }

  console.log('Account types: 1) Standard  2) Rewards  3) Credit');
  const typeChoice = (await rl.question('Choose account type (1-3): ')).trim();
  const accountNumber = (await rl.question('Account number: ')).trim();
  const openingRaw = (await rl.question('Opening balance (leave blank for 0): ')).trim();
  const openingBalance = openingRaw === '' ? 0 : Number.parseFloat(openingRaw);

  try {
    let account;
    if (typeChoice === '2') {
      const rateRaw = (await rl.question('Reward rate % (e.g. 2.5): ')).trim();
      account = new RewardsDiningAccount(accountNumber, openingBalance, Number.parseFloat(rateRaw));
    } else if (typeChoice === '3') {
      const limitRaw = (await rl.question('Credit limit (e.g. 500): ')).trim();
      account = new CreditDiningAccount(accountNumber, openingBalance, Number.parseFloat(limitRaw));
    } else {
      account = new DiningAccount(accountNumber, openingBalance);
    }

    accounts.push(account);
    student.assignDiningAccount(account);

    console.log('\n[ACCOUNT CREATED]');
    console.log(account.displayAccountSummary());
    console.log(`Assigned to: ${student.getFullName()} (${student.studentId})`);
  } catch (err) {
    console.log(`\n[REJECTED] ${err.message}`);
  }
}

async function depositToAccount() {
  if (accounts.length === 0) {
    console.log('\nNo accounts yet.');
    return;
  }
  const accountNumber = (await rl.question('\nAccount number: ')).trim();
  const account = findAccount(accountNumber);
  if (!account) {
    console.log('\n[ERROR] No account found with that number.');
    return;
  }
  const amountRaw = (await rl.question('Deposit amount: ')).trim();
  const description = (await rl.question('Description (optional): ')).trim();

  try {
    const amount = Number.parseFloat(amountRaw);
    // Simulated overloading: deposit(amount) vs deposit(amount, description).
    const newBalance = description ? account.deposit(amount, description) : account.deposit(amount);
    console.log(`\n[OK] Deposit successful. New balance: K${newBalance.toFixed(2)}`);
  } catch (err) {
    console.log(`\n[ERROR] ${err.message}`);
  }
}

async function payForBooking() {
  if (bookings.length === 0) {
    console.log('\nNo bookings yet.');
    return;
  }
  listBookings();
  const idxRaw = await rl.question('\nEnter booking number to pay for: ');
  const idx = Number.parseInt(idxRaw, 10) - 1;
  const booking = bookings[idx];

  if (!booking) {
    console.log('\n[ERROR] Invalid booking number.');
    return;
  }

  const student = booking.student;
  const account = student instanceof Student ? student.getDiningAccount() : undefined;
  if (!account) {
    console.log('\n[ERROR] This student has no dining account assigned. Use "Create a dining account" first.');
    return;
  }

  // processPayment() calls the same payForMeal() method regardless of
  // account type - polymorphism decides what actually happens.
  const result = booking.processPayment(account);
  console.log(result.success ? `\n[PAYMENT SUCCESSFUL] ${result.message}` : `\n[PAYMENT FAILED] ${result.message}`);
  console.log(booking.getSummary());
  console.log(account.displayAccountSummary());
}

function viewAllAccounts() {
  console.log('\n--- All Dining Accounts (Polymorphic Display) ---');
  if (accounts.length === 0) {
    console.log('No accounts yet.');
    return;
  }
  // Same loop, same method call, different behaviour per account type.
  for (const account of accounts) {
    console.log('\n' + account.displayAccountSummary());
  }
}

async function viewTransactionHistory() {
  if (accounts.length === 0) {
    console.log('\nNo accounts yet.');
    return;
  }
  const accountNumber = (await rl.question('\nAccount number: ')).trim();
  const account = findAccount(accountNumber);
  if (!account) {
    console.log('\n[ERROR] No account found with that number.');
    return;
  }

  const transactions = account.getTransactions();
  console.log('\n----------------------------------------');
  console.log('           TRANSACTION HISTORY');
  console.log('----------------------------------------');

  if (transactions.length === 0) {
    console.log('No transactions yet.');
    return;
  }

  transactions.forEach((t, i) => {
    console.log(`\n${i + 1}. ${t.type} - K${t.amount.toFixed(2)}`);
    console.log(`   Description: ${t.description}`);
    console.log(`   Date/Time: ${t.dateTime.toLocaleString()}`);
    console.log(`   Balance: K${t.balanceAfter.toFixed(2)}`);
  });
  console.log(`\nTotal Transactions: ${transactions.length}`);
}

/**
 * Runs every scenario required by the Lab 3 brief in one deterministic
 * pass: base account demo, insufficient-funds test, rewards demo,
 * credit demo + limit-exceeded test, polymorphism loop, simulated
 * constructor/method overloading, and full Student + Account +
 * MealBooking payment integration (including the duplicate-payment
 * test). The objects it creates are also added to the app's normal
 * students/accounts/bookings arrays, so they show up in the other
 * menu options afterwards too.
 */
async function runRequiredDemonstrations() {
  const line = '='.repeat(60);

  // ---------- 1. Standard DiningAccount ----------
  console.log(`\n${line}\nDEMONSTRATION 1: Standard DiningAccount\n${line}`);
  const standardAccount = new DiningAccount('DA001', 1000);
  standardAccount.deposit(500);
  const standardPay = standardAccount.payForMeal(200, 'Meal payment');
  console.log(standardAccount.displayAccountSummary());
  console.log(`Payment of K200.00: ${standardPay.success ? 'Payment successful' : standardPay.message}`);
  console.log(`Final Balance: K${standardAccount.getBalance().toFixed(2)}`);

  console.log('\n--- Insufficient standard balance test ---');
  const lowBalanceAccount = new DiningAccount('DA003', 50);
  const rejectedPay = lowBalanceAccount.payForMeal(200, 'Meal payment');
  console.log(`Payment of K200.00 against K50.00 balance: ${rejectedPay.success ? 'Payment successful' : rejectedPay.message}`);
  console.log(`Balance unchanged: K${lowBalanceAccount.getBalance().toFixed(2)}`);

  // ---------- 2. RewardsDiningAccount ----------
  console.log(`\n${line}\nDEMONSTRATION 2: RewardsDiningAccount\n${line}`);
  const rewardsAccount = new RewardsDiningAccount('RA001', 1500, 2.5);
  rewardsAccount.deposit(500);
  console.log(`Balance Before Reward: K${rewardsAccount.getBalance().toFixed(2)}`);
  console.log(`Reward Rate: ${rewardsAccount.rewardRate}%`);
  const rewardEarned = rewardsAccount.calculateReward();
  console.log(`Reward Earned: K${rewardEarned.toFixed(2)}`);
  rewardsAccount.applyReward();
  console.log(`Final Balance: K${rewardsAccount.getBalance().toFixed(2)}`);

  // ---------- 3. CreditDiningAccount ----------
  console.log(`\n${line}\nDEMONSTRATION 3: CreditDiningAccount\n${line}`);
  const creditAccount = new CreditDiningAccount('CA001', 1000, 500);
  const withinLimitPay = creditAccount.payForMeal(1500, 'Catering payment');
  console.log(`Payment of K1,500.00 (within limit): ${withinLimitPay.success ? 'Payment successful' : withinLimitPay.message}`);
  console.log(`Resulting Balance: K${creditAccount.getBalance().toFixed(2)}`);

  const overLimitPay = creditAccount.payForMeal(100, 'Extra payment');
  console.log(`\nPayment of K100.00 (exceeds limit): ${overLimitPay.success ? 'Payment successful' : overLimitPay.message}`);
  console.log(`Balance unchanged: K${creditAccount.getBalance().toFixed(2)}`);

  // ---------- 4. Polymorphism ----------
  console.log(`\n${line}\nDEMONSTRATION 4: Polymorphic Account Processing\n${line}`);
  const diningAccounts = [standardAccount, rewardsAccount, creditAccount];
  console.log('Calling the SAME displayAccountSummary() method on every object:');
  for (const account of diningAccounts) {
    console.log('\n' + account.displayAccountSummary());
  }

  // ---------- 5. Simulated constructor/method overloading ----------
  console.log(`\n${line}\nDEMONSTRATION 5: Simulated Constructor and Method Overloading\n${line}`);
  const overloadNoBalance = new DiningAccount('DA004');
  const overloadWithBalance = new DiningAccount('DA005', 500);
  console.log(`new DiningAccount("DA004")       -> balance K${overloadNoBalance.getBalance().toFixed(2)}`);
  console.log(`new DiningAccount("DA005", 500)  -> balance K${overloadWithBalance.getBalance().toFixed(2)}`);
  overloadWithBalance.deposit(100);
  overloadWithBalance.deposit(100, 'Additional meal funds');
  console.log('\naccount.deposit(100) and account.deposit(100, "Additional meal funds"):');
  overloadWithBalance.getTransactions().forEach((t) => console.log(` - ${t.type} K${t.amount.toFixed(2)} (${t.description})`));

  // Keep the demo accounts visible in the rest of the app too.
  accounts.push(standardAccount, lowBalanceAccount, rewardsAccount, creditAccount, overloadNoBalance, overloadWithBalance);

  // ---------- 6. Student + Account + MealBooking integration ----------
  console.log(`\n${line}\nDEMONSTRATION 6: Student, Account and Booking Integration\n${line}`);
  let demoStudent = findStudent('DWU2026001');
  if (!demoStudent) {
    demoStudent = new Student('DWU2026001', 'Maria', 'Kila');
    students.push(demoStudent);
  }
  const bookingAccount = new RewardsDiningAccount('RA099', 100, 2.5);
  accounts.push(bookingAccount);
  if (!demoStudent.getDiningAccount()) {
    demoStudent.assignDiningAccount(bookingAccount);
  }

  console.log('========================================');
  console.log('        STUDENT DINING ACCOUNT');
  console.log('========================================');
  console.log(`Student: ${demoStudent.getFullName()}`);
  console.log(`Student ID: ${demoStudent.studentId}`);
  console.log(`Account Type: ${bookingAccount.accountType}`);
  console.log(`Account Number: ${bookingAccount.accountNumber}`);
  console.log(`Opening Balance: K${bookingAccount.getBalance().toFixed(2)}`);

  const demoBooking = new MealBooking({
    student: demoStudent,
    mealDate: '2026-09-10',
    mealType: 'Dinner',
    quantity: 2,
    dietaryNote: '',
  });
  bookings.push(demoBooking);

  console.log('\n========================================');
  console.log('             MEAL BOOKING');
  console.log('========================================');
  console.log(`Meal: ${demoBooking.mealType}`);
  console.log(`Quantity: ${demoBooking.quantity}`);
  console.log(`Total Cost: K${demoBooking.calculateTotal().toFixed(2)}`);

  const paymentResult = demoBooking.processPayment(bookingAccount);
  console.log(`Payment Status: ${paymentResult.success ? 'Successful' : `Failed - ${paymentResult.message}`}`);
  console.log(`Booking Status: ${demoBooking.bookingStatus}`);
  console.log(`Remaining Balance: K${bookingAccount.getBalance().toFixed(2)}`);

  console.log('\n========================================');
  console.log('           TRANSACTION HISTORY');
  console.log('========================================');
  bookingAccount.getTransactions().forEach((t, i) => {
    console.log(`${i + 1}. ${t.type} - K${t.amount.toFixed(2)}`);
    console.log(`   Description: ${t.description}`);
    console.log(`   Balance: K${t.balanceAfter.toFixed(2)}`);
  });
  console.log(`\nTotal Transactions: ${bookingAccount.getTransactions().length}`);

  console.log('\n--- Duplicate payment test ---');
  const duplicateResult = demoBooking.processPayment(bookingAccount);
  console.log(
    duplicateResult.success
      ? 'Unexpected: payment succeeded a second time.'
      : `Correctly rejected: ${duplicateResult.message}`
  );

  console.log(`\n${line}\nEND OF REQUIRED DEMONSTRATIONS\n${line}`);
}

function printMenu() {
  console.log('\n========================================');
  console.log('        DWU DINING MEAL BOOKING');
  console.log('========================================');
  console.log('1.  Add booking');
  console.log('2.  View all bookings');
  console.log('3.  Confirm a booking');
  console.log('4.  Cancel a booking');
  console.log('5.  View student booking history');
  console.log('6.  Update student name');
  console.log('7.  Create a dining account for a student');
  console.log('8.  Deposit into a dining account');
  console.log('9.  Pay for a booking using a dining account');
  console.log('10. View all dining accounts');
  console.log("11. View an account's transaction history");
  console.log('12. Run required Lab 3 demonstrations');
  console.log('13. Exit');
}

async function main() {
  let running = true;
  while (running) {
    printMenu();
    const choice = (await rl.question('Choose an option (1-13): ')).trim();
    try {
      switch (choice) {
        case '1':
          await addBooking();
          break;
        case '2':
          listBookings();
          break;
        case '3':
          await confirmOrCancel('confirm');
          break;
        case '4':
          await confirmOrCancel('cancel');
          break;
        case '5':
          await viewBookingHistory();
          break;
        case '6':
          await updateStudentName();
          break;
        case '7':
          await createDiningAccount();
          break;
        case '8':
          await depositToAccount();
          break;
        case '9':
          await payForBooking();
          break;
        case '10':
          viewAllAccounts();
          break;
        case '11':
          await viewTransactionHistory();
          break;
        case '12':
          await runRequiredDemonstrations();
          break;
        case '13':
          running = false;
          console.log('\nGoodbye!');
          break;
        default:
          console.log('\nPlease choose a valid option (1-13).');
      }
    } catch (err) {
      // Top-level safety net: keep the program running instead of crashing.
      console.log(`\n[UNEXPECTED ERROR] ${err.message}`);
    }
  }
  rl.close();
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  rl.close();
  process.exit(1);
});
