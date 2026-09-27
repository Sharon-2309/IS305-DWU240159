# Week 13 — Distinction Design Decisions

Three deliberate deviations from a literal reading of the brief, made to keep
the system internally consistent. Worth a paragraph each in the technical
documentation and ready to explain at the defence.

## 1. A fourth specialised request class: `GeneralServiceRequest`

The brief requires "at least three" specialised `ServiceRequest` subclasses
and names `ICTSupportRequest`, `MaintenanceRequest`, `CleaningRequest`. But
Distinction also requires `ServiceRequest` to become abstract-style —
`getRequestSummary()`, `calculatePriorityScore()` and
`getTargetResolutionHours()` throw on the base class. Combined, that leaves
the fourth category, **General Campus Service**, with nowhere to live: it
has no dedicated subclass, and the base class now refuses to work directly.
Any report that called `calculatePriorityScore()` across *all* requests
would crash the moment a General Campus Service request existed.

`GeneralServiceRequest` (contact preference, urgency reason, estimated
duration) closes that gap. Every category now has a concrete leaf class,
`ServiceRequest` is never instantiated directly anywhere in the application,
and polymorphic code (reports, the demonstration loop) can safely assume
every object in the requests array has real, working overrides.

## 2. Abstract-style base class: what throws and what doesn't

Only the three methods the brief names — `getRequestSummary()`,
`calculatePriorityScore()`, `getTargetResolutionHours()` — throw on the base
`ServiceRequest`. `validate()` keeps a real (if minimal) implementation,
because the brief itself relies on `super.validate()` being callable and
useful from every subclass. The old concrete `getRequestSummary()` logic
didn't disappear — it moved to `getCommonSummaryLine()`, which every
subclass's own `getRequestSummary()` override calls internally, so the
"summary" behaviour is still centrally maintained, just no longer exposed
under a name that's supposed to signal "you must override this."

## 3. Menu renumbering

Console menu items 1–9 are untouched — exact wording and order from the
Pass-level "Required Console Menu." Item 10 ("Exit") moved to item 20,
with items 10–19 added for the Credit workflow, Distinction reports, and
audit trail. This was necessary, not optional: the brief explicitly states
that "declaring subclasses without using them in the working application is
not sufficient," and the Credit/Distinction functionality has no way to be
exercised interactively without a menu path to it. Extending the menu is
what makes that requirement actually satisfiable.

## Everything else, as designed

- **Repositories** (`FileRepository` base + `UserFileRepository`,
  `ServiceRequestFileRepository`, `RequestHistoryFileRepository`,
  `AuditFileRepository`) only ever handle plain objects — no repository
  file imports `User` or `ServiceRequest`. `CampusServiceApp` never touches
  `fs` directly; all persistence happens inside `ServiceRequestManager`.
- **Factories** (`UserFactory`, `ServiceRequestFactory`) are the only code
  that turns plain JSON data back into real class instances. A private,
  restore-only `_restoreState()` on `ServiceRequest` lets the factory set
  status/history/assignment directly after construction, bypassing the
  normal transition rules — a saved "Closed" request comes back Closed, not
  replayed through the whole workflow again.
- **Audit trail** is written on every single mutating action (register,
  submit, update, cancel, review, assign priority, assign technician, begin
  work, record progress, resolve, close) with actor, action, affected
  request, description, timestamp and result — kept both in memory
  (`getAuditLog()`) and in `data/auditLog.json`.
- **Reports** (7 implemented, brief requires 4+): grouped by status/category
  /priority, urgent requests, overdue requests (using
  `getTargetResolutionHours()` against elapsed time — a genuine use of the
  polymorphic method, not just a demo), requests/completions by Technician,
  average resolution time, and volume by location. All built with
  `filter`/`map`/`reduce` over the in-memory arrays.

## Verification

`node src/week13-manual-check.js` — 16 checks, 0 failures, including a full
kill-and-reload cycle (save state, construct a brand-new
`ServiceRequestManager`, reload from JSON, confirm the restored objects are
the correct subclasses with working polymorphic methods, and confirm a
restored request can continue its workflow to completion).

Combined regression across Weeks 8, 9, 11, 12 and 13: **80/80 checks pass,
0 failures.**

Automated `node --test` suite (10+ formal tests, per the brief) is scoped to
Week 14 alongside final packaging — these manual check scripts are quick
smoke tests, not the graded Distinction test suite itself.
