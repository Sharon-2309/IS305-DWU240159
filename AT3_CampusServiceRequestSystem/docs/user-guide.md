# User Guide — Campus Service Request Management System

## Installation Requirements

- **Node.js 18 or later** (uses `readline/promises`, `fs/promises`, private
  class fields, and the built-in `node:test` runner — all native, no
  external packages required).
- No database. No internet connection required to run the application.

## Setup Instructions

1. Unzip or clone the project.
2. Open a terminal in the project's root folder (the one containing
   `package.json`).
3. Install dependencies (there are none beyond Node.js itself, but this
   creates `package-lock.json` and confirms your environment is set up):
   ```bash
   npm install
   ```

## How to Start the Application

```bash
node src/CampusServiceApp.js
```
or equivalently:
```bash
npm start
```

On startup, the application loads any previously saved data from the
`data/` folder and reports how much it found:

```
====================================================
           CAMPUS SERVICE REQUEST SYSTEM
====================================================
Loaded from data/: 0 user(s), 0 request(s), 0 audit entrie(s).
```

If this is the very first run, `data/` won't exist yet — that's normal, it
is created automatically the first time you register a user or submit a
request.

## The Main Menu

```
====================================================
    CAMPUS SERVICE REQUEST SYSTEM
====================================================
1. Register User
2. Submit Service Request
3. View Request by ID
4. View My Requests
5. View All Requests
6. Update My Request
7. Cancel My Request
8. Search Requests
9. View Request Summary
---- Credit workflow (Service Officer / Technician) ----
10. Review Request
11. Assign Priority
12. Assign Technician
13. Begin Work
14. Record Progress
15. Resolve Request
16. Verify & Close Request
---- Distinction: reports & audit ----
17. View Management Reports
18. View Audit Trail for a Request
19. View All Registered Users
20. Exit
====================================================
```

Type a number and press Enter to choose an option. The application always
returns to this menu after each action, until you choose **20** to exit.

## How to Register or Select a User

Choose **1**. You'll be asked for a User ID (invent your own — e.g. a
student/staff number), name, email, and a **User type**:
`Student`, `Staff`, `ServiceOfficer`, `Technician`, or `Administrator`.

Depending on the type you choose, you'll be asked one extra question:
- **Student** → Programme, Year level (1-6)
- **Staff** → Department
- **ServiceOfficer** → Service section
- **Technician** → Technical speciality
- **Administrator** → no extra field

There is no "login" step — throughout the rest of the menu, you simply
type the User ID of whoever is performing the action (the requester, the
Service Officer, or the Technician) when asked.

**Example (captured console output):**
```
--- Register User ---
User ID: DWU2026001
First name: Sharon
Last name: Kaupa
Email address: sharon@dwu.ac.pg
User type (Student/Staff/ServiceOfficer/Technician/Administrator): Student
Programme: BIS
Year level (1-6): 3

User registered successfully:
User ID: DWU2026001
Name: Sharon Kaupa
Email: sharon@dwu.ac.pg
Type: Student
Programme: BIS
Year Level: 3
```

## How to Submit a Request

Choose **2**. Enter your User ID, then the request title, description,
location, **category**, and **priority**. The category you choose
determines which extra questions you're asked:

| Category | Extra questions |
|---|---|
| ICT Support | Device type, System name, Fault type, Network impact |
| Facilities Maintenance | Building, Room number, Hazard level, Equipment affected |
| Cleaning and Sanitation | Cleaning area, Hygiene risk, Service type, Preferred service time |
| General Campus Service | Contact preference, Urgency reason, Estimated duration (minutes) |

**Example (captured console output):**
```
--- Submit Service Request ---
Your User ID: DWU2026001
Request title: Unable to access campus Wi-Fi
Description: Wi-Fi has been down since this morning
Campus location: Library Level 2
Category (ICT Support / Facilities Maintenance / Cleaning and Sanitation / General Campus Service): ICT Support
Priority (Low / Normal / High / Urgent): High
Device type: Laptop
System name: Campus Wi-Fi
Fault type: No connectivity
Network impact (None/Partial/Full Outage): Partial

Request submitted successfully:
[REQ001] Unable to access campus Wi-Fi (ICT Support, High) - Status: Submitted
- Requested by: Sharon Kaupa - Location: Library Level 2 | Device: Laptop
(Campus Wi-Fi) - Fault: No connectivity - Network impact: Partial
```

Request IDs (`REQ001`, `REQ002`, ...) are generated automatically — you
never have to invent one.

## How to Assign and Process a Request (Service Officer / Technician)

This is the Credit-level workflow, options **10-16**. It must happen in
order — the system enforces this and will reject anything out of sequence:

1. **10 — Review Request** *(Service Officer)*
2. **11 — Assign Priority** *(Service Officer)*
3. **12 — Assign Technician** *(Service Officer)*
4. **13 — Begin Work** *(the assigned Technician only)*
5. **14 — Record Progress** *(the assigned Technician only, any time while In Progress)*
6. **15 — Resolve Request** *(the assigned Technician only)*
7. **16 — Verify & Close Request** *(Service Officer)*

For each, you'll enter your own User ID (proving your role/identity), the
Request ID, and an optional comment. If you try to act outside your role,
or out of order, you'll get a clear error, e.g.:

```
Error: User "DWU2026001" is a Student and is not permitted to review
requests — only a ServiceOfficer may do this.
```

## How to Search and Generate Reports

- **8 — Search Requests**: matches by request ID or title text.
- **9 — View Request Summary**: request counts grouped by status.
- **17 — View Management Reports**: a submenu of 9 reports — by category,
  by priority, urgent requests, overdue requests, requests/completions by
  Technician, average resolution time, and volume by location.
- **18 — View Audit Trail for a Request**: enter a Request ID to see every
  logged action against it, or leave blank for the full audit log.
- **19 — View All Registered Users**.

**Example (viewing your own requests, option 4):**
```
--- View My Requests ---
Your User ID: DWU2026001

[REQ001] Unable to access campus Wi-Fi (ICT Support, High) - Status: Submitted
- Requested by: Sharon Kaupa - Location: Library Level 2 | Device: Laptop
(Campus Wi-Fi) - Fault: No connectivity - Network impact: Partial
```

## Common Errors and Solutions

| Error message | What it means | Solution |
|---|---|---|
| `No user found with that ID.` | You entered a User ID that hasn't been registered. | Register the user first (option 1), or check for a typo. |
| `Duplicate user ID: "..." is already registered.` | That User ID already exists. | Choose a different ID, or use the existing one instead of re-registering. |
| `Unsupported category: "...".` / `Unsupported priority: "...".` | You typed something outside the allowed list. | Re-enter using exactly one of the listed options (case-sensitive). |
| `User "..." is a [Type] and is not permitted to [action] — only a [Type] may do this.` | You tried a Credit-workflow action with the wrong role. | Use a User ID registered as the correct role, or register one first. |
| `Technician "..." is not permitted to [action] on request "..." — it is assigned to a different technician.` | You tried to begin work/resolve a job assigned to someone else. | Only the Technician named in "Assign Technician" can act on that request. |
| `Invalid status transition for request ...: cannot move from "X" to "Y".` | You tried to skip a workflow step (e.g. assign a technician before reviewing). | Follow the order: Review → Assign Priority → Assign Technician → Begin Work → Record Progress → Resolve → Verify & Close. |
| `Cannot cancel request ...: only Submitted requests can be cancelled at Pass level.` | You tried to cancel a request that's already moved past Submitted. | Cancellation is only available while a request hasn't been reviewed yet. |
| `Warning: could not load saved data (...). Starting with an empty system.` | A data file exists but is corrupted/unreadable. | Check `data/*.json` are valid JSON; delete a corrupted file to start fresh (you will lose that file's data). |

If you see an error not listed here, the message itself is written to be
read directly — it names the field or rule that failed.
