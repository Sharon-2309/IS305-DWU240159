# Lab 2 – Dining Booking Credit Extension

**Student name:** _Sharon PETER_
**Student ID:** _240159_
**GitHub repository URL:** _https://github.com/Sharon-2309/IS305-DWU240159_

## How Lab 2 extends Lab 1

Lab 1 stored a student's ID and name directly inside each `MealBooking`
object, which meant the same student's details were duplicated across every
booking they made. Lab 2 fixes that by introducing a separate `Student`
class. Each `MealBooking` now holds a reference to a `Student` object
(`#student`) instead of its own copies of the ID and name. The existing
`MealBooking.js` and `DiningApp.js` from Lab 1 were extended, not replaced —
validation, cost calculation, duplicate-booking prevention, and
confirm/cancel all continue to work exactly as before.

## The Student class (`Student.js`)

`Student` has three private fields: `#studentId`, `#firstName`, `#lastName`.
The constructor uses `this.studentId = ...` etc. so that construction
re-uses the same setters used for later updates — the setters reject an
empty ID, first name, or last name in either case. Two methods are
provided: `getFullName()` (combines first + last name) and `displayInfo()`
(a formatted block showing the student's ID and full name).

## How Student and MealBooking are connected

`DiningApp.js` keeps a `students` array. When adding a booking:
- If the entered Student ID already exists in `students`, the **same**
  `Student` object is reused (no name re-entry needed).
- Otherwise, a new `Student` is created from the entered ID/first/last name
  and added to the array.

The `MealBooking` constructor now accepts `{ student, ... }` and stores the
`Student` object directly. `getSummary()` reads the student's name live from
that object (`student.getFullName()`), so if the student's name is updated
later (menu option 6, using the `firstName`/`lastName` setters), every
existing booking for that student shows the new name automatically — because
they all point to the same object in memory, not separate copies.

## Files

| File | Purpose |
|---|---|
| `Student.js` | The `Student` class: private fields, constructor, getters/controlled setters, `getFullName()`, `displayInfo()`. |
| `MealBooking.js` | Refactored from Lab 1 to store a `Student` reference instead of raw ID/name. Same validation, `calculateTotal()`, `confirmBooking()`, `cancelBooking()`, `getSummary()` behaviour as before. |
| `DiningApp.js` | Console application. Menu-driven: add booking, view all bookings, confirm/cancel, view a student's booking history, update a student's name, exit. |
| `README.md` | This file. |

## How to run

```
node DiningApp.js
```

No extra packages needed — only Node's built-in `readline` module.

## Menu options

1. Add booking (creates or reuses a `Student`, then creates a `MealBooking`)
2. View all bookings
3. Confirm a booking (Pending → Confirmed)
4. Cancel a booking (→ Cancelled)
5. View a student's booking history (`displayBookingHistory()`)
6. Update a student's first/last name
7. Exit

## Tests completed

1. **Valid Student object** – entered a complete new student (DWU2026001, Maria Kila) with a Lunch booking. Student and booking were created and displayed correctly.
2. **Invalid student information** – tested an empty Student ID and, separately, an empty first name for a new student. Both were rejected with a clear error message instead of crashing the app.
3. **Student and booking integration** – added a second booking using the same Student ID (DWU2026001); the app reused the existing `Student` object (confirmed by the "Existing student found" message) rather than creating a duplicate.
4. **Updated student name** – updated DWU2026001's first name from "Maria" to "Marie" via menu option 6, then viewed all bookings. Both existing bookings displayed "Marie Kila", proving the shared object reference.
5. **Booking history** – viewed DWU2026001's booking history: correctly listed both bookings, a total of 2 bookings, and a combined cost of K50.00.

## AI tool use

Portions of this code were developed with the assistance of Claude (Anthropic AI). The requirements, class design, and testing approach were reviewed and understood by the student before submission.
