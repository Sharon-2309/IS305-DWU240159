# Requirements Document — Campus Service Request Management System

## 1. Project Background

Divine Word University's students and staff currently report campus issues — ICT
faults, damaged facilities, cleaning needs and other service requests — through
phone calls, informal conversations or handwritten notes. This project replaces
that informal process with a structured, auditable console application.

## 2. Problem Statement

There is no shared, trackable record of campus service issues. Requests can be
lost, forgotten, duplicated, or left with no clear owner, and requesters have no
way to check whether their issue has been picked up, is in progress, or resolved.

## 3. Project Objectives

1. Give requesters a consistent way to submit and track service requests.
2. Give Service Officers a way to triage, prioritise and assign requests.
3. Give Technicians a way to view assigned work and record progress.
4. Enforce a controlled status workflow so requests cannot skip steps improperly.
5. Persist all records so data survives beyond a single program run.
6. Provide management reporting for oversight and workload visibility.

## 4. Project Scope

See README.md for full in-scope/out-of-scope statement. In summary: a single-user,
console-based JavaScript application covering the full request lifecycle for four
categories and four roles, with JSON file persistence and no database.

## 5. Actors and User Roles

| Actor | Description | Key Responsibilities |
|---|---|---|
| Student Requester | A student submitting a campus service issue | Submit, view, update, cancel own requests |
| Staff Requester | A staff member submitting a campus service issue | Submit, view, update, cancel own requests |
| Service Officer | Triages incoming requests | Review, set priority, assign Technician, verify and close |
| Technician | Carries out the work | View assigned requests, record progress, resolve |
| System Administrator | Oversees the system | Review records, audit history, generate management reports |

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | The system shall allow a new user to register with a unique user ID. |
| FR2 | The system shall reject registration with a duplicate user ID. |
| FR3 | The system shall reject registration with missing names or an invalid email address. |
| FR4 | The system shall allow a registered requester to submit a service request in one of four categories. |
| FR5 | The system shall assign a default status of "Submitted" to every new request. |
| FR6 | The system shall reject a request with a missing title, description, unsupported category, or unsupported priority value. |
| FR7 | The system shall allow a requester to view all of their own submitted requests. |
| FR8 | The system shall allow any user to view a single request by its request ID. |
| FR9 | The system shall allow a requester to update their own request while it is still Submitted. |
| FR10 | The system shall allow a requester to cancel their own request while it is still Submitted. |
| FR11 | The system shall prevent a requester from updating or cancelling another user's request. |
| FR12 | The system shall prevent cancellation of a request that is already Cancelled. |
| FR13 | The system shall allow a Service Officer to review a request, assign a priority, and assign a Technician. |
| FR14 | The system shall allow only the assigned Technician to begin work and record progress on a request. |
| FR15 | The system shall allow only a Service Officer to verify and close a Resolved request. |
| FR16 | The system shall enforce the status flow Submitted → Reviewed → Assigned → In Progress → Resolved → Closed, and reject invalid transitions. |
| FR17 | The system shall allow search of requests by request ID or title. |
| FR18 | The system shall allow filtering of requests by category, status, priority, or assigned Technician. |
| FR19 | The system shall allow sorting of requests by date submitted or priority. |
| FR20 | The system shall maintain a history entry for every status-changing action on a request. |

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR1 | The application must run as a Node.js console application with no graphical interface. |
| NFR2 | The application must not use any database — only JavaScript objects/arrays (Pass/Credit) and JSON files (Distinction). |
| NFR3 | The application must display clear, human-readable error messages for all invalid input. |
| NFR4 | The application's menu and prompts must remain responsive and understandable to a non-technical user. |
| NFR5 | The codebase must separate concerns — domain classes, data access (repositories) and the console menu must not be mixed together. |
| NFR6 | The application must only ever store simulated data — no real personal, institutional or confidential information. |

## 8. Assumptions and Limitations

**Assumptions**
- Only one user operates the console application at a time (no concurrent multi-user access).
- All data entered is simulated for assessment purposes.
- Users are trusted to select their correct role/user ID when interacting with the console menu (no login/password authentication is implemented at Pass/Credit level).

**Limitations**
- No graphical or web interface — console only.
- No email/SMS notifications when a request changes status.
- No file attachments (e.g. photos of damage) can be added to a request.
- No real-time multi-user concurrency handling for the JSON files.

## 9. User Stories

1. **As a** Student Requester, **I want to** submit an ICT support request describing my
   Wi-Fi problem, **so that** it gets logged and assigned to someone who can fix it.
2. **As a** Staff Requester, **I want to** report a damaged classroom light, **so that**
   Facilities Maintenance is aware and can act on it.
3. **As a** Requester, **I want to** view all of my own submitted requests, **so that**
   I can check their current status without asking anyone.
4. **As a** Requester, **I want to** update my request while it is still Submitted,
   **so that** I can correct a mistake before it is reviewed.
5. **As a** Requester, **I want to** cancel my own request while it is still Submitted,
   **so that** I don't waste staff time if the issue resolves itself.
6. **As a** Service Officer, **I want to** review incoming requests and assign a
   priority, **so that** urgent issues are handled before minor ones.
7. **As a** Service Officer, **I want to** assign a request to a Technician with the
   right specialty, **so that** the work goes to someone qualified to do it.
8. **As a** Technician, **I want to** view only the requests assigned to me, **so
   that** I can focus on my own workload.
9. **As a** Technician, **I want to** record progress notes and resolve a request,
   **so that** there is a clear record of what was done.
10. **As a** Service Officer, **I want to** verify and close a Resolved request,
    **so that** the requester can be confident the issue is genuinely fixed.
11. **As a** System Administrator, **I want to** view management reports by category,
    priority and Technician, **so that** I can monitor workload and performance.
12. **As a** System Administrator, **I want to** review the audit trail of a request,
    **so that** I can confirm exactly who did what and when.

---
*Last updated: Week 7 — supersedes any earlier drafts. Diagrams in `docs/diagrams/`
represent the initial (Pass-level) design and will be revisited at the Week 10 Pass
checkpoint and again for Credit/Distinction extensions.*
