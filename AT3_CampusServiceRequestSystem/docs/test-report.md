# Test Report

**Automated suite:** `node --test` (Node.js built-in test runner)
**Location:** `tests/` (5 files: `user.test.js`, `serviceRequest.test.js`, `workflow.test.js`,
`persistence.test.js`, `reports.test.js`)
**Run with:** `npm test` or `node --test`
**Result at time of writing: 34/34 pass, 0 fail, 0 cancelled.**

All tests use a temporary directory created with `fs.mkdtemp()` under the OS
temp folder (or an isolated in-memory `Object.create()` for the two
abstract-class checks). No test reads or writes anything under the
application's real `data/` folder.

Every category required by the brief is covered: valid object construction,
invalid constructor values, duplicate identifiers, role permissions,
controlled status transitions, specialised request behaviour, polymorphic
method calls, saving JSON data, loading and restoring saved objects, missing
or empty data files, report calculations, and file-reading/file-writing
errors.

---

## `tests/user.test.js` — User construction, validation, inheritance

| ID | Feature Tested | Test Input | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| U01 | Valid object construction | Valid userId/name/email/type | User constructs, `getFullName()` correct | As expected | Pass |
| U02 | Invalid constructor values | Empty userId | Throws "User ID is required" | As expected | Pass |
| U03 | Invalid constructor values | Malformed email | Throws "Invalid email address" | As expected | Pass |
| U04 | Invalid constructor values | Unsupported userType ("Alien") | Throws "Unsupported user type" | As expected | Pass |
| U05 | Inheritance / constructor chaining | `new StudentRequester(...)` | `userType` auto-set to "Student" via `super()`, `instanceof User` true | As expected | Pass |
| U06 | Specialised request/user behaviour | Year level 9 (out of 1-6 range) | Throws on year level | As expected | Pass |
| U07 | Invalid constructor values (inherited) | StudentRequester with bad email | Throws "Invalid email address" (inherited check still runs) | As expected | Pass |
| U08 | Inheritance / constructor chaining | `new StaffRequester(...)` | `userType` fixed to "Staff", department stored | As expected | Pass |

## `tests/serviceRequest.test.js` — abstract base, specialised subclasses, polymorphism

| ID | Feature Tested | Test Input | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| S01 | Abstract-style base class | Call `getRequestSummary()` on bare `ServiceRequest` prototype | Throws "must override" | As expected | Pass |
| S02 | Abstract-style base class | Call `calculatePriorityScore()` on bare `ServiceRequest` prototype | Throws "must override" | As expected | Pass |
| S03 | Valid object construction | Valid ICTSupportRequest data | Constructs, category fixed to "ICT Support", status "Submitted" | As expected | Pass |
| S04 | Invalid constructor values | Unsupported `networkImpact` | Throws "Unsupported network impact" | As expected | Pass |
| S05 | Invalid constructor values | Missing `roomNumber` | Throws "Room number is required" | As expected | Pass |
| S06 | Invalid constructor values (inherited) | Unsupported priority ("Catastrophic") | Throws "Unsupported priority" (base check still runs) | As expected | Pass |
| S07 | Specialised request behaviour | `getRequestSummary()` on all 4 concrete types | Each summary contains its own specialised fields | As expected | Pass |
| S08 | Polymorphic method calls | `calculatePriorityScore()`/`getTargetResolutionHours()` looped over a mixed array of 4 types | Correct type-specific numeric result for every object, same method call | As expected | Pass |

## `tests/workflow.test.js` — duplicate IDs, role permissions, status transitions

| ID | Feature Tested | Test Input | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| W01 | Duplicate identifiers | Register two users with the same userId | Second rejected: "Duplicate user ID" | As expected | Pass |
| W02 | Duplicate identifiers | Submit two requests with the same requestId | Second rejected: "Duplicate request ID" | As expected | Pass |
| W03 | Role permissions | Student attempts `reviewRequest()` | Rejected: "not permitted to review requests" | As expected | Pass |
| W03b | Role permissions | Service Officer performs `reviewRequest()` | Succeeds, status becomes "Reviewed" | As expected | Pass |
| W04 | Role permissions | Wrong Technician attempts `beginWork()` on someone else's assignment | Rejected: "not permitted to begin work" | As expected | Pass |
| W04b | Role permissions | Correct assigned Technician performs `beginWork()` | Succeeds, status becomes "In Progress" | As expected | Pass |
| W05 | Controlled status transitions | Attempt `assignTechnician()` while status is still "Submitted" | Rejected (must be Reviewed first / invalid transition) | As expected | Pass |
| W06 | Controlled status transitions | Full sequence: review → priority → assign → begin → progress → resolve → close | Reaches "Closed" with no errors | As expected | Pass |
| W07 | Controlled status transitions | Attempt `reviewRequest()` again after status is "Closed" | Rejected: "Invalid status transition" (Closed is final) | As expected | Pass |

## `tests/persistence.test.js` — saving, loading, restoring, missing/empty files, write errors

| ID | Feature Tested | Test Input | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| P01 | Missing data files | `loadAll()` on a repository pointed at a directory with no `users.json` yet | Returns `[]`, no error | As expected | Pass |
| P02 | Empty data files | `loadAll()` on a zero-byte `users.json` | Returns `[]`, no error | As expected | Pass |
| P03 | File-writing errors | `saveAll()` targeting a path where a *file* blocks the required directory | Throws "Failed to write ..." | As expected | Pass |
| P04 | Saving JSON data | Register one user | `users.json` written to disk with correct `userId` | As expected | Pass |
| P05 | Loading and restoring saved objects | Save 3 users + 1 request (Assigned) then construct a brand-new manager over the same directory and call `loadAll()` | Correct counts loaded; restored request is `ICTSupportRequest` with status "Assigned", correct specialised field, correct requester subclass, history intact | As expected | Pass |
| P06 | Loading and restoring saved objects | Restored (previously "In Progress") request continues workflow: `resolveRequest()` then `verifyAndClose()` on the reloaded instance | Reaches "Closed" successfully | As expected | Pass |

## `tests/reports.test.js` — management report calculations

| ID | Feature Tested | Test Input | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| R01 | Report calculations | 1 ICT (Urgent) + 1 Maintenance (Normal, closed) request | `getRequestsGroupedByCategory()` returns 1 entry per category | As expected | Pass |
| R02 | Report calculations | Same data set | `getUrgentRequests()` returns exactly the 1 Urgent request | As expected | Pass |
| R03 | Report calculations | Same data set | `getRequestSummaryByStatus()` shows `Submitted: 1, Closed: 1` | As expected | Pass |
| R04 | Report calculations | 1 completed request with a real elapsed duration | `getAverageResolutionTimeHours()` returns a non-negative number | As expected | Pass |
| R05 | Report calculations | 1 request resolved+closed by a specific Technician | `getCompletedRequestsByTechnician()` returns exactly that 1 request | As expected | Pass |

---

## Summary

| Category (per brief) | Tests |
|---|---|
| Valid object construction | U01, S03 |
| Invalid constructor values | U02-U04, U07, S04-S06 |
| Duplicate identifiers | W01, W02 |
| Role permissions | W03, W03b, W04, W04b |
| Controlled status transitions | W05, W06, W07 |
| Specialised request behaviour | U05, U06, U08, S07 |
| Polymorphic method calls | S08 |
| Saving JSON data | P04 |
| Loading and restoring saved objects | P05, P06 |
| Missing or empty data files | P01, P02 |
| Report calculations | R01-R05 |
| File-reading or file-writing errors | P03 |

**Total: 34 automated tests, all passing.** (Brief requires 10+.)

Manual smoke-check scripts (`src/week8-manual-check.js` through
`src/week13-manual-check.js`, 80 checks) were used during development for
fast iteration week-to-week and are kept in the repository as additional
evidence of progressive work, but the automated suite above in `tests/` is
the graded Distinction/Week 14 deliverable.
