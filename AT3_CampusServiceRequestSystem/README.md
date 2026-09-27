# AT3 Major Project — Campus Service Request Management System

**Student Name:** [Sharon PETER]
**Student ID:** [240159]
**Course:** IS305 — Object-Oriented Programming (JavaScript)
**Assessment:** AT3 Major Project — 20%, 50 marks
**GitHub Repository:** [https://github.com/Sharon-2309/IS305-DWU240159]

---

## Project Description

The Campus Service Request Management System is a Node.js console application
that replaces informal, untracked ways of reporting campus issues (phone
calls, verbal reports, handwritten notes) with a structured system for
logging, assigning, processing and monitoring service requests across the
university campus.

## Problem Statement

Students and staff currently report ICT problems, damaged facilities,
cleaning needs and other campus service issues through phone calls, informal
conversations or handwritten notes. These methods make it difficult to track
requests, assign responsibility, monitor progress, or confirm whether a
reported problem has actually been resolved. There is no shared record of
what was reported, who is responsible, or the current status of the work.

## Project Objectives

1. Provide a single, structured way for students and staff to submit campus
   service requests (ICT, facilities, cleaning, general service).
2. Allow Service Officers to review, prioritise and assign requests to
   Technicians.
3. Allow Technicians to record progress and resolve assigned work.
4. Give every stakeholder visibility into request status from submission to
   closure.
5. Maintain a full history and audit trail of every action taken on a
   request.
6. Persist all data between sessions using JSON files (no database).
7. Demonstrate encapsulation, inheritance, polymorphism and abstraction
   across the Pass, Credit and Distinction components of the system.

## Project Scope

**In scope**
- Console-based (command-line) application built in Node.js and JavaScript.
- Four request categories: ICT Support, Facilities Maintenance, Cleaning and
  Sanitation, General Campus Service.
- Four user roles: Student Requester, Staff Requester, Service Officer,
  Technician (plus a plain Administrator role for record review/audit).
- Full request lifecycle: Submitted → Reviewed → Assigned → In Progress →
  Resolved → Closed (or Cancelled).
- JSON file persistence, audit logging, management reporting, automated
  testing.

**Out of scope**
- Any external database (MongoDB, MySQL, SQLite, etc.) — explicitly
  prohibited.
- A graphical user interface or web front end.
- Real student/staff data, real institutional records, or authentication
  against a live university system — all data used is simulated.
- Notifications (email/SMS), file attachments, or payment processing.

## Achievement Components Completed

- [x] **Pass (25 marks)** — core service request workflow: `User`,
      `ServiceRequest`, `ServiceRequestManager`, `CampusServiceApp`,
      full console menu, validation, array-based storage.
- [x] **Credit (10 marks)** — inheritance hierarchies (`StudentRequester`,
      `StaffRequester`, `ServiceOfficer`, `Technician`, `ICTSupportRequest`,
      `MaintenanceRequest`, `CleaningRequest`), constructor chaining,
      controlled status workflow, role permissions, request history.
- [x] **Distinction (15 marks)** — polymorphism, abstract-style base class,
      a fourth request subclass (`GeneralServiceRequest`), JSON file
      persistence via repository classes, factory-based object restoration,
      audit trail, 7 management reports, 34 automated tests.

## Project Folder Structure

```
AT3_CampusServiceRequestSystem/
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
├── data/                                 # JSON persistence (created at runtime)
│   ├── users.json
│   ├── serviceRequests.json
│   ├── requestHistory.json
│   └── auditLog.json
├── src/
│   ├── User.js
│   ├── StudentRequester.js
│   ├── StaffRequester.js
│   ├── ServiceOfficer.js
│   ├── Technician.js
│   ├── ServiceRequest.js
│   ├── ICTSupportRequest.js
│   ├── MaintenanceRequest.js
│   ├── CleaningRequest.js
│   ├── GeneralServiceRequest.js
│   ├── ServiceRequestManager.js
│   ├── CampusServiceApp.js
│   ├── UserFactory.js
│   ├── ServiceRequestFactory.js
│   ├── repositories/
│   │   ├── FileRepository.js
│   │   ├── UserFileRepository.js
│   │   ├── ServiceRequestFileRepository.js
│   │   ├── RequestHistoryFileRepository.js
│   │   └── AuditFileRepository.js
│   └── week*-manual-check.js             # weekly dev-time progress evidence (optional)
├── tests/                                # graded automated test suite (node:test)
│   ├── user.test.js
│   ├── serviceRequest.test.js
│   ├── workflow.test.js
│   ├── persistence.test.js
│   └── reports.test.js
└── docs/
    ├── requirements.md
    ├── week10-checkpoint.md
    ├── week13-design-decisions.md
    ├── user-guide.md
    ├── test-report.md
    ├── technical-documentation.md
    └── diagrams/
        ├── use-case-diagram.svg / .png
        ├── class-diagram.svg / .png
        └── sequence-diagram-submit-request.svg / .png
```

## Weekly Progress Log

| Week | Milestone | Status |
|---|---|---|
| 5 | Project setup — repo, folder structure, README, problem statement, objectives, scope | ✅ Complete |
| 6 | Requirements analysis — actors, functional/non-functional requirements, user stories | ✅ Complete |
| 7 | OOP design — use case diagram, initial class diagram, request-submission sequence diagram | ✅ Complete |
| 8 | Pass implementation 1 — `User` and `ServiceRequest` classes, constructors, encapsulation, validation | ✅ Complete |
| 9 | Pass implementation 2 — `ServiceRequestManager`, console menu, search/update/cancel | ✅ Complete |
| 10 | Pass checkpoint — full working Pass workflow, updated design evidence | ✅ Complete |
| 11 | Credit implementation — inheritance, constructor chaining, specialised classes | ✅ Complete |
| 12 | Credit workflow — technician assignment, role permissions, status workflow, history | ✅ Complete |
| 13 | Distinction implementation — polymorphism, JSON repositories, restoration, reports, audit | ✅ Complete |
| 14 | Final submission and defence | ✅ Complete |

## Installation and Running

**Requirements:** Node.js 18 or later. No database. No external packages.

```bash
npm install
node src/CampusServiceApp.js
npm test
```

`npm install` has nothing to fetch (all dependencies are built into
Node.js) but generates `package-lock.json` and confirms your environment
works. `npm test` runs the automated suite in `tests/` (`node --test`) —
expect `34 pass, 0 fail`. See `docs/user-guide.md` for a full walkthrough
of the console menu with real example output.

## Known Limitations

- Single-user console session — no concurrent multi-user access or file
  locking. Two instances of the app running against the same `data/`
  folder at once could overwrite each other's changes.
- No authentication — any User ID can be typed in at any prompt; the
  system trusts that the person at the keyboard is who they say they are.
- No notifications (email/SMS) when a request changes status.
- `getOverdueRequests()` compares wall-clock time to `dateSubmitted`, so
  its result depends on the machine's clock and won't mean much for data
  restored long after the fact in a demo environment.
- Requesters can only cancel a request while it is still `Submitted` —
  once reviewed, cancellation is no longer available (matches the brief's
  stated role permissions).

## Future Improvements

- Multi-user concurrent access with proper file locking, if the
  "no database" constraint were ever lifted.
- Simple username/password authentication instead of trusting typed
  User IDs.
- Email or SMS notification hooks on status change (the audit trail
  already captures every event that would trigger one).
- A richer "overdue" report that accounts for a request being paused or
  reassigned rather than simple linear time-since-submission.
- Allowing a Service Officer to reassign a Technician mid-workflow rather
  than only once.

## AI Use Declaration

# AI Tool Used: Claude (Anthropic)

# Purpose of Use:
Claude was used as an assistance and support tool during the development of this AT3 Major Project. 
I was responsible for designing, developing, testing, and making decisions about the system. 
Claude was mainly used to help clarify programming concepts, identify and correct errors, 
troubleshoot problems, review implementation approaches, and provide 
suggestions when I encountered difficulties during development.

# Assessment Component(s) Affected:

Source code: The classes and components in src/, including the User and ServiceRequest hierarchies, 
ServiceRequestManager, CampusServiceApp, factories, and repositories.
Automated test suite: The tests in tests/, including the 34 automated tests using Node's built-in test runner.
Documentation: Requirements document, user guide, test report, and technical documentation.
UML diagrams: Claude was used to assist with the initial diagram structure and ideas.
 The final diagrams were manually created and adapted by me in draw.io.

# Summary of Prompts Used:
My prompts mainly asked for assistance with understanding the assignment requirements, 
checking programming logic, explaining errors, troubleshooting code, improving implementation approaches, 
developing and checking automated tests, and reviewing documentation. I also asked for guidance on UML diagrams, 
JSON persistence, inheritance, polymorphism, repositories, factories, and the overall system structure. 
The assistance was used progressively as I developed each part of the project.

# How the Output Was Checked:
I developed the system and tested the functionality throughout the project. When I encountered errors or 
unexpected behaviour, I used Claude to help identify possible causes and solutions, 
then Claude tested the suggested changes. The automated test suite was run in claude, 
with 34/34 tests passing and also performed manual smoke testing and live console testing 
to verify the request workflow from registration through to closure. 
I reviewed the implementation to ensure that it met the assessment requirements and 
that I could explain the class hierarchy, encapsulation, constructor chaining, polymorphism, 
status workflow, JSON persistence and restoration, and repository pattern.

# How the Output Was Corrected or Adapted:
Claude's suggestions were reviewed rather than being accepted automatically. When suggestions did not work 
or did not match the requirements of my project, I prompted claude to try different approaches and
 made the necessary changes. I used Claude to help identify programming errors and corrected them, 
 but I made the final decisions about how the code should be implemented. I also asked Claude to modify and 
 adapt the code to fit my project structure and requirements. The UML diagrams were manually drawn in draw.io,
  and the documentation was reviewed and changed to accurately reflect my final implementation.

# Declaration:
I remain fully responsible for all submitted work. I developed and tested the project myself and 
used Claude as an assistance tool for clarification, troubleshooting, error correction, and review.
 I confirm that I understand the submitted implementation and am able to explain and defend the work.

## Final Checklist

- [ ] The Pass workflow works from beginning to end.
- [ ] Credit features extend the Pass application.
- [ ] Distinction features extend the Pass and Credit application.
- [ ] The application starts without syntax errors.
- [ ] Invalid input produces clear messages.
- [ ] The UML diagrams match the final code.
- [ ] The test report contains expected and actual results.
- [ ] The repository shows development from Week 5 to Week 14.
- [ ] The final code was pushed before the deadline.
- [ ] The GitHub code matches the submitted ZIP file.
- [ ] The ZIP file opens correctly.
- [ ] The README contains working setup instructions.
- [ ] Only simulated data has been used.
- [ ] No database has been added.
- [ ] The AI Use Declaration has been completed.
- [ ] I am prepared to explain and defend my code.
