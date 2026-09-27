# Technical Documentation — Campus Service Request Management System

## 1. Project Folder Structure

```
AT3_CampusServiceRequestSystem/
├── README.md
├── package.json / package-lock.json
├── .gitignore
├── data/                       # JSON persistence (created at runtime)
│   ├── users.json
│   ├── serviceRequests.json
│   ├── requestHistory.json
│   └── auditLog.json
├── src/
│   ├── User.js                 # base user, abstract-ish role container
│   ├── StudentRequester.js      \
│   ├── StaffRequester.js         \  User subclasses (Credit)
│   ├── ServiceOfficer.js         /
│   ├── Technician.js            /
│   ├── ServiceRequest.js       # base request, abstract-style (Distinction)
│   ├── ICTSupportRequest.js     \
│   ├── MaintenanceRequest.js     \  ServiceRequest subclasses (Credit)
│   ├── CleaningRequest.js        /
│   ├── GeneralServiceRequest.js /  (added beyond the brief's minimum 3 — see §11)
│   ├── ServiceRequestManager.js # in-memory store + permissions + workflow + reports
│   ├── CampusServiceApp.js     # console UI — the only place readline is used
│   ├── UserFactory.js          # rebuilds correct User subclass from JSON
│   ├── ServiceRequestFactory.js # rebuilds correct ServiceRequest subclass from JSON
│   ├── repositories/
│   │   ├── FileRepository.js            # shared load/save/create/find/update logic
│   │   ├── UserFileRepository.js
│   │   ├── ServiceRequestFileRepository.js
│   │   ├── RequestHistoryFileRepository.js
│   │   └── AuditFileRepository.js
│   └── week*-manual-check.js   # dev-time smoke checks, one per week (not the graded suite)
├── tests/                       # the graded automated test suite (node:test)
│   ├── user.test.js
│   ├── serviceRequest.test.js
│   ├── workflow.test.js
│   ├── persistence.test.js
│   └── reports.test.js
└── docs/
    ├── requirements.md
    ├── diagrams/ (use case, class, sequence — SVG + PNG)
    ├── week10-checkpoint.md
    ├── week13-design-decisions.md
    ├── user-guide.md
    ├── test-report.md
    └── technical-documentation.md   (this file)
```

## 2. Responsibility of Each Class

| Class | Responsibility |
|---|---|
| `User` | Identity and shared fields for every person in the system (ID, name, email, role). Owns its own validation. |
| `StudentRequester` / `StaffRequester` / `ServiceOfficer` / `Technician` | Role-specific fields and validation on top of `User`. Fix their own `userType` via `super()`. |
| `ServiceRequest` | Shared request fields, the controlled status-transition state machine, request history, and the abstract-style contract every concrete request type must fulfil. |
| `ICTSupportRequest` / `MaintenanceRequest` / `CleaningRequest` / `GeneralServiceRequest` | One category each. Fix their own `category` via `super()`, add category-specific fields, and supply the concrete `getRequestSummary()` / `calculatePriorityScore()` / `getTargetResolutionHours()` the base class demands. |
| `ServiceRequestManager` | The only class allowed to hold the live arrays of users/requests. Enforces ownership rules, role permissions, generates IDs, coordinates persistence and audit logging, and computes all management reports. |
| `CampusServiceApp` | The console menu. Talks only to `ServiceRequestManager` — never touches `fs` or a JSON file directly. |
| `UserFactory` / `ServiceRequestFactory` | Turn a plain object loaded from JSON back into the correct, fully-behavioural class instance. |
| `FileRepository` (+ 4 subclasses) | All file I/O. `ServiceRequestManager` calls these; nothing else does. |

## 3. Where Encapsulation Is Used

Every domain class (`User` and all subclasses, `ServiceRequest` and all
subclasses) stores its state in `#privateFields`, exposed only through
explicit getters and — where a field can legitimately change after
construction — controlled setters that validate before assigning (e.g.
`User.setEmail()` rejects a malformed address before it's stored).
`ServiceRequestManager` itself encapsulates the `#users` and `#requests`
arrays — nothing outside the class can reach them directly; every read
goes through a method that returns a defensive copy (e.g. `getAllUsers()`
returns `[...this.#users]`), so external code can't mutate internal state
by holding a reference to the live array.

## 4. Where Inheritance and Constructor Chaining Are Used

- `StudentRequester`, `StaffRequester`, `ServiceOfficer`, `Technician` all
  `extends User` and call `super(userId, firstName, lastName, email, <fixedType>)`
  as the first line of their constructor.
- `ICTSupportRequest`, `MaintenanceRequest`, `CleaningRequest`,
  `GeneralServiceRequest` all `extends ServiceRequest` and call
  `super(requestId, requester, title, description, location, <fixedCategory>, priority)`.
- The four `FileRepository` subclasses all `extends FileRepository` and
  call `super(filePath, idField)`, fixing which file and which ID field
  they operate on.

## 5. Where Method Overriding and Polymorphism Are Used

`ServiceRequest` declares `getRequestSummary()`, `calculatePriorityScore()`,
and `getTargetResolutionHours()` as abstract-style methods (they throw if
called on the base class itself — see §6). Every concrete subclass
overrides all three with type-specific logic. `ServiceRequestManager`'s
reports and `CampusServiceApp`'s "View All Requests" loop over a single
mixed array of these four types and call the exact same three method
names on every object — each object runs its own overridden version. This
is exercised directly in `tests/serviceRequest.test.js`
("Polymorphism — same method calls, type-specific behaviour").

`User` and its subclasses similarly override `validate()`, `displayInfo()`,
and `getSpecialisedFields()`.

## 6. Abstract-Style Base Class

`ServiceRequest.getRequestSummary()`, `.calculatePriorityScore()`, and
`.getTargetResolutionHours()` throw a clear error naming the offending
class if called without being overridden. Subclasses reuse the base
class's shared logic via `this.getCommonSummaryLine()` (a concrete,
non-abstract helper) rather than calling `super.getRequestSummary()`,
since the latter is now guaranteed to throw.

**A fourth subclass, `GeneralServiceRequest`, was added beyond the
brief's minimum three** specifically to make this abstract-style design
work cleanly: the brief lists four request categories but only requires
three specialised classes, and without a class for "General Campus
Service," that category would have nowhere to live except the now-abstract
base class — crashing any report that called the abstract methods on it.
Full reasoning is in `docs/week13-design-decisions.md`.

## 7. How the Request Workflow Is Controlled

`ServiceRequest` holds a static `ALLOWED_TRANSITIONS` map (e.g.
`Submitted: ['Reviewed', 'Cancelled']`) and a single private gatekeeper,
`#transitionTo()`, that every status-changing method
(`reviewRequest()`, `assignTechnician()`, `beginWork()`, `resolveRequest()`,
`verifyAndClose()`, `cancelRequest()`) routes through. Any transition not
explicitly listed is rejected with a clear error naming the attempted jump.

`ServiceRequest` only knows about **status** rules — it has no concept of
who is allowed to trigger a transition. That's `ServiceRequestManager`'s
job: `#requireUserOfType()` and `#requireAssignedTechnician()` check the
caller's role (and, for Technicians, that they're specifically the
*assigned* one) before ever calling the request's own workflow method.
This two-layer split (state machine vs. permissions) keeps each class's
job narrow and is exercised in `tests/workflow.test.js`.

## 8. How Validation and Errors Are Handled

Every constructor validates itself immediately and throws a descriptive
`Error` on the first problem found — invalid objects are never
constructable in the first place. A subtlety worth noting: JavaScript
initialises a subclass's own private fields *after* `super()` returns, so
the base classes (`User`, `ServiceRequest`) cannot call their own
overridable, public `validate()` from inside their constructor — a
subclass override would try to read its own not-yet-initialised private
fields and crash. The fix: each base class splits validation into a
private, non-overridable `#validateOwnFields()` (always safe, called from
the constructor) and a public `validate()` that subclasses override and
call explicitly, themselves, once all of their own fields exist.

At the console layer, every menu action's `await manager.xxx()` call is
wrapped in a single `try/catch` in the main loop, so any thrown error —
from validation, permissions, or a workflow transition — becomes a
readable one-line message to the user instead of crashing the app.

## 9. How JSON Data Is Stored and Restored

Each domain object has a `toData()` method returning a plain,
JSON-safe object (including a `requestType`/discriminator so the object
can be correctly rebuilt later, and a `specialisedFields` sub-object for
whatever's unique to that subclass). `ServiceRequestManager` calls
`toData()` and hands the result to the appropriate repository
(`create()` for a brand-new record, `update()` for an existing one) after
every mutation — `CampusServiceApp` never touches a file directly.

On startup, `ServiceRequestManager.loadAll()` reads `users.json` first
(via `UserFactory.createFromData()`, which switches on `userType` to pick
the right subclass constructor), then `serviceRequests.json` (via
`ServiceRequestFactory.createFromData()`, switching on `requestType`).
Because a freshly-constructed object always starts at status `Submitted`
with empty history, the factory calls a restore-only method,
`request._restoreState()`, immediately afterwards to overwrite status,
assigned technician, dates and history with the actual saved values —
bypassing the normal transition rules, which only make sense for a
*live* object being worked on, not one being reloaded into whatever state
it was already validly in.

## 10. How Tests Are Organised

Two layers exist, deliberately kept separate:
- **`src/week8-manual-check.js` … `week13-manual-check.js`** — plain
  scripts (not `node:test`) written and run once per week during
  development, as fast incremental proof each week's new code worked
  before building the next week on top of it. Not the graded deliverable.
- **`tests/*.test.js`** — the actual graded automated suite, using
  Node's built-in test runner (`node --test` / `npm test`). 34 tests
  across 5 files, covering every category the brief requires (see
  `docs/test-report.md` for the full mapping). Every test that touches
  the filesystem uses `fs.mkdtemp()` to get an isolated temporary
  directory and never reads or writes the application's real `data/`
  folder.

## 11. Known Limitations

- Single-user console session — no concurrent multi-user access or file
  locking. Two instances of the app running against the same `data/`
  folder at once could overwrite each other's changes.
- No authentication — any User ID can be typed in at any prompt; the
  system trusts that the person at the keyboard is who they say they are.
- No notifications (email/SMS) when a request changes status.
- `getOverdueRequests()` compares wall-clock time to `dateSubmitted`, so
  its result depends on the machine's clock and won't mean much for data
  restored long after the fact in a demo environment.
- Requesters cannot cancel a request once it has been Reviewed — only
  while still `Submitted` (matches the brief's stated role permissions,
  but is worth being aware of during the live demo).

## 12. Future Improvements

- Multi-user concurrent access with proper file locking or a lightweight
  lock file, if the "no database" constraint were ever lifted.
- Simple username/password authentication instead of trusting typed
  User IDs.
- Email or SMS notification hooks on status change (the audit trail
  already captures every event that would trigger one).
- A richer "overdue" report that accounts for a request being paused/
  reassigned rather than simple linear time-since-submission.
- Allowing a Service Officer to reassign a Technician mid-workflow rather
  than only once, for cases where the first assignment turns out wrong.
