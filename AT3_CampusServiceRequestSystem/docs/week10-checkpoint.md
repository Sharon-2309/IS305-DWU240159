# Week 10 — Pass Checkpoint

**Status: Pass component complete and verified.**

## 1. Required Pass Tests — mapped to actual evidence

| Test (from brief) | Expected Result | Verified by | Result |
|---|---|---|---|
| Valid user registration | User is added successfully | `week9-manual-check.js` — "Register first user" | ✅ Pass |
| Duplicate user ID | Second user is rejected | `week9-manual-check.js` — "Duplicate user ID is rejected" | ✅ Pass |
| Valid request submission | Request is stored with Submitted status | `week9-manual-check.js` — "Submit a valid request" | ✅ Pass |
| Invalid request category | Request is rejected clearly | `week8-manual-check.js` / `week9` — unsupported category tests | ✅ Pass |
| View requester records | Only the selected user's requests are shown | `week9-manual-check.js` — "getRequestsByUser() returns only the selected requester's requests" | ✅ Pass |
| Cancel Submitted request | Status changes to Cancelled | `week8` and `week9` — cancelRequest() tests | ✅ Pass |

**28/28 automated smoke checks pass** across `week8-manual-check.js` and
`week9-manual-check.js` (run both with `node src/week8-manual-check.js` and
`node src/week9-manual-check.js`).

## 2. Full workflow confirmation

The complete Pass workflow — **register → submit → view → search → update →
cancel** — was run end-to-end through the actual `CampusServiceApp.js` console
menu (not just the underlying classes), confirming:

- Registration rejects invalid data and duplicate IDs with clear messages.
- Submission stores a new request with status `Submitted` and an
  auto-generated unique ID.
- "View My Requests" only shows the acting user's own requests.
- "View All Requests" shows every request in the system.
- "Search Requests" matches by both request ID and title text.
- "Update My Request" successfully changes an editable field (tested with
  priority) and leaves untouched fields alone.
- "Cancel My Request" changes status to `Cancelled` and blocks a second
  cancellation of the same request.
- "View Request Summary" correctly reflects the Submitted/Cancelled counts
  after each action.
- Attempting to update or cancel another user's request is rejected with a
  clear ownership error — this was validated at the `ServiceRequestManager`
  level and is ready to extend into full role permissions at Credit
  (Week 12).

**Separate code fragments that do not work together will not satisfy the
Pass Component** — this checkpoint used the real, wired-together
`CampusServiceApp` → `ServiceRequestManager` → `ServiceRequest`/`User` chain,
not isolated unit tests, so this requirement is met.

## 3. Design evidence update

`docs/diagrams/class-diagram.svg` has been revised to match the actual
submitted code rather than the original Week 7 sketch:

- `ServiceRequestManager` now shows `getAllUsers()` and `generateRequestId()`,
  which were added during implementation but weren't in the initial design.
- `CampusServiceApp` now lists its real private per-menu-item handler methods
  instead of the placeholder `run()`/`handleUserChoice()` names used in the
  Week 7 draft.
- The use case diagram and sequence diagram were re-checked against the
  final Pass behaviour and required no changes — the submit-request flow
  they describe matches the implementation exactly.

## 4. What's next (Credit, Week 11 onward)

The Pass foundation is stable and fully working, which the brief requires
before Credit marks can be earned. Week 11 will extend — not replace — this
code with `User` and `ServiceRequest` subclasses via inheritance.
