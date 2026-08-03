/*
  Program: Dining Meal Booking Feature
  Student Name: Sharon PETER
  Student ID: 240159
  Date: 01 August 2026
  Description: Node.js console application for the DWU Dining Services
  meal booking system. Lets a student enter booking details, validates
  the input, prevents duplicate bookings, calculates the total cost and
  displays a clear booking receipt.
*/

'use strict';

const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const MealBooking = require('./MealBooking');

const rl = readline.createInterface({ input, output });

/** All bookings created during this session, stored in memory only. */
/** @type {MealBooking[]} */
const bookings = [];

/**
 * Prevents a duplicate booking where the same student ID, meal date
 * and meal type already exist in the array.
 */
function isDuplicateBooking(studentId, mealDate, mealType) {
  return bookings.some(
    (b) =>
      b.studentId === studentId &&
      b.mealDate === mealDate &&
      b.mealType === mealType
  );
}

async function addBooking() {
  console.log('\n--- New Meal Booking ---');
  const studentId = (await rl.question('Student ID: ')).trim();
  const studentName = (await rl.question('Student name: ')).trim();
  const mealDate = (await rl.question('Meal date (YYYY-MM-DD): ')).trim();
  const mealType = (await rl.question('Meal type (Breakfast/Lunch/Dinner): ')).trim();
  const quantityRaw = (await rl.question('Quantity: ')).trim();
  const dietaryNote = (await rl.question('Dietary note (optional): ')).trim();

  const quantity = Number.parseInt(quantityRaw, 10);

  // Check duplicates before creating the object so we can give a clear message.
  if (studentId && mealDate && mealType && isDuplicateBooking(studentId, mealDate, mealType)) {
    console.log('\n[REJECTED] A booking already exists for this student, date and meal type.');
    return;
  }

  const booking = new MealBooking({
    studentId,
    studentName,
    mealDate,
    mealType,
    quantity,
    dietaryNote,
  });

  const { valid, errors } = booking.validate();
  if (!valid) {
    console.log('\n[REJECTED] Booking could not be created:');
    errors.forEach((e) => console.log(` - ${e}`));
    return;
  }

  bookings.push(booking);
  console.log('\n[BOOKING CREATED]');
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

function printMenu() {
  console.log('\n========================================');
  console.log('        DWU DINING MEAL BOOKING');
  console.log('========================================');
  console.log('1. Add booking');
  console.log('2. View all bookings');
  console.log('3. Confirm a booking');
  console.log('4. Cancel a booking');
  console.log('5. Exit');
}

async function main() {
  let running = true;
  while (running) {
    printMenu();
    const choice = (await rl.question('Choose an option (1-5): ')).trim();
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
          running = false;
          console.log('\nGoodbye!');
          break;
        default:
          console.log('\nPlease choose a valid option (1-5).');
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
