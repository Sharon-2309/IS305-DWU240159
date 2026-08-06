/*
  Program: Dining Meal Booking Feature - Lab 2 (Credit Extension)
  Student Name:Sharon PETER
  Student ID: 240159
  Date: 6 August 2026
  Description: Node.js console application for the DWU Dining Services
  meal booking system. Extends the Lab 1 application by introducing a
  Student class: a Student object stores a student's identity, and one
  or more MealBooking objects can be connected to the same Student
  object. Updating the student's name through the app updates every
  booking that references that Student, because they share the same
  object reference rather than duplicate copies of the data.
*/

'use strict';

const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const Student = require('./Student');
const MealBooking = require('./MealBooking');

const rl = readline.createInterface({ input, output });

/** All Student objects created this session, keyed by studentId. */
/** @type {Student[]} */
const students = [];

/** All bookings created this session, stored in memory only. */
/** @type {MealBooking[]} */
const bookings = [];

function findStudent(studentId) {
  return students.find((s) => s.studentId === studentId);
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
 * already exists (Task 4 relies on this: bookings for the same student
 * must reference the SAME object, not a new copy of it), otherwise
 * collects a first/last name and creates a new Student.
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
    console.log('This student\'s existing bookings now show the updated name too, since they reference the same Student object.');
  } catch (err) {
    console.log(`\n[ERROR] ${err.message}`);
  }
}

function printMenu() {
  console.log('\n========================================');
  console.log('        DWU DINING MEAL BOOKING');
  console.log('========================================');
  console.log('1. Add booking');
  console.log('2. View all bookings');
  console.log('3. Confirm a booking');
  console.log('4. Cancel a booking');
  console.log('5. View student booking history');
  console.log('6. Update student name');
  console.log('7. Exit');
}

async function main() {
  let running = true;
  while (running) {
    printMenu();
    const choice = (await rl.question('Choose an option (1-7): ')).trim();
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
          running = false;
          console.log('\nGoodbye!');
          break;
        default:
          console.log('\nPlease choose a valid option (1-7).');
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
