# AT3 Major Project — Campus Service Request Management System

**Student Name:** [Sharon PETER]
**Student ID:** [240159]
**Course:** IS305 — Object-Oriented Programming (JavaScript)
**Assessment:** AT3 Major Project — 20%, 50 marks
**GitHub Repository:** [https://github.com/Sharon-2309/IS305-DWU240159]

---

## Project Description

The Campus Service Request Management System is a Node.js console application that
replaces informal, untracked ways of reporting campus issues (phone calls, verbal
reports, handwritten notes) with a structured system for logging, assigning,
processing and monitoring service requests across the university campus.

## Problem Statement

Students and staff currently report ICT problems, damaged facilities, cleaning needs
and other campus service issues through phone calls, informal conversations or
handwritten notes. These methods make it difficult to track requests, assign
responsibility, monitor progress, or confirm whether a reported problem has actually
been resolved. There is no shared record of what was reported, who is responsible,
or the current status of the work.

## Project Objectives

1. Provide a single, structured way for students and staff to submit campus service
   requests (ICT, facilities, cleaning, general service).
2. Allow Service Officers to review, prioritise and assign requests to Technicians.
3. Allow Technicians to record progress and resolve assigned work.
4. Give every stakeholder visibility into request status from submission to closure.
5. Maintain a full history and audit trail of every action taken on a request.
6. Persist all data between sessions using JSON files (no database).
7. Demonstrate encapsulation, inheritance, polymorphism and abstraction across the
   Pass, Credit and Distinction components of the system.

## Project Scope

**In scope**
- Console-based (command-line) application built in Node.js and JavaScript.
- Four request categories: ICT Support, Facilities Maintenance, Cleaning and
  Sanitation, General Campus Service.
- Four user roles: Requester (Student/Staff), Service Officer, Technician, System
  Administrator.
- Full request lifecycle: Submitted → Reviewed → Assigned → In Progress → Resolved →
  Closed (or Cancelled).
- JSON file persistence, audit logging, management reporting, automated testing
  (Distinction component).

**Out of scope**
- Any external database (MongoDB, MySQL, SQLite, etc.) — explicitly prohibited.
- A graphical user interface or web front end.
- Real student/staff data, real institutional records, or authentication against a
  live university system — all data used is simulated.
- Notifications (email/SMS), file attachments, or payment processing.

## Achievement Components Attempted

- [x] Pass (25 marks) — core service request workflow
- [x] Credit (10 marks) — inheritance and role-based workflow
- [x] Distinction (15 marks) — polymorphism, JSON persistence, reporting, testing

*(Status will be updated as each component is completed week by week.)*

## Project Folder Structure

```
AT3_CampusServiceRequestSystem/
├── README.md
├── package.json
├── src/                  # Application source code (from Week 8)
├── data/                 # JSON data files (from Week 13 — Distinction)
├── tests/                # Automated tests (from Week 13 — Distinction)
└── docs/
    ├── requirements.md   # Week 6 — requirements document
    └── diagrams/         # Week 7 — UML diagrams
        ├── use-case-diagram.svg
        ├── class-diagram.svg
        └── sequence-diagram-submit-request.svg
```

## Weekly Progress Log

| Week | Milestone | Status |
|---|---|---|
| 5 | Project setup — repo, folder structure, README, problem statement, objectives, scope | ✅ Complete |
| 6 | Requirements analysis — actors, functional/non-functional requirements, user stories | ✅ Complete |
| 7 | OOP design — use case diagram, initial class diagram, request-submission sequence diagram | ✅ Complete |
| 8 | Pass implementation 1 — `User` and `ServiceRequest` classes, constructors, encapsulation, validation | ⬜ Next |
| 9 | Pass implementation 2 — `ServiceRequestManager`, console menu, search/update/cancel | ⬜ |
| 10 | Pass checkpoint — full working Pass workflow, updated diagrams | ⬜ |
| 11 | Credit implementation — inheritance, constructor chaining, specialised classes | ⬜ |
| 12 | Credit workflow — technician assignment, role permissions, status workflow, history | ⬜ |
| 13 | Distinction implementation — polymorphism, JSON repositories, restoration, reports, audit | ⬜ |
| 14 | Final submission and defence | ⬜ |

## Installation and Running (to be completed from Week 8)

```bash
npm install
node src/CampusServiceApp.js
npm test
```

## Known Limitations

To be documented as the project develops.

## Future Improvements

To be documented as the project develops.

## AI Use Declaration

[To be completed per DWU academic integrity policy before final submission.]
