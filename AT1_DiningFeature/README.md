# AT1 – Dining Meal Booking Feature

**Student name:** _SharonPETER_
**Student ID:** _240159_
**GitHub repository URL:** _paste your repo URL here, e.g. https://github.com/your-username/IS305-YourStudentID_

## Description

A console-based Dining Meal Booking feature for DWU Dining Services, built with
JavaScript classes running on Node.js. A student can book a meal, and the
program validates the entered information, calculates the total cost, prevents
duplicate bookings, and displays a clear booking receipt. All booking data is
stored temporarily in memory (a JavaScript array) — no database is used.

## Files

| File | Purpose |
|---|---|
| `MealBooking.js` | Defines the `MealBooking` class: private fields, constructor, getters/setters, and the `validate()`, `calculateTotal()`, `confirmBooking()`, `cancelBooking()` and `getSummary()` methods. |
| `DiningApp.js` | The Node.js console application. Prompts the student for booking details via `readline/promises`, creates `MealBooking` objects, stores them in an array, and drives a menu (add / view / confirm / cancel / exit). |
| `README.md` | This file. |

## How to run

1. Make sure [Node.js](https://nodejs.org) is installed (no extra packages needed — the app only uses Node's built-in `readline` module).
2. From inside the `AT1_DiningFeature` folder, run:

```
node DiningApp.js
```

3. Use the on-screen menu:
   - **1** – Add a booking (enter Student ID, name, meal date, meal type, quantity, dietary note)
   - **2** – View all bookings
   - **3** – Confirm a booking (Pending → Confirmed)
   - **4** – Cancel a booking (→ Cancelled)
   - **5** – Exit

## Meal prices

| Meal type | Price per meal |
|---|---|
| Breakfast | K10.00 |
| Lunch | K15.00 |
| Dinner | K20.00 |

## Tests completed

1. **Valid booking** – entered a complete, correct booking (Maria Kila, DWU2026001, Lunch x2 on 2026‑07‑18). The booking was created and the correct total (K30.00) was displayed.
2. **Invalid booking** – submitted a booking with a missing Student ID, missing name, and quantity of 0. The application rejected it and listed each specific validation error instead of crashing.
3. **Duplicate booking** – attempted to book the same student ID, meal date and meal type a second time. The application rejected the second attempt with a clear message.

Confirm/Cancel were also tested: confirming a Pending booking correctly changes its status to Confirmed, and cancelling changes it to Cancelled.
