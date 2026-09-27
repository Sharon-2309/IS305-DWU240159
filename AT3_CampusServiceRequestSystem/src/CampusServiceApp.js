'use strict';

const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const User = require('./User');
const StudentRequester = require('./StudentRequester');
const StaffRequester = require('./StaffRequester');
const ServiceOfficer = require('./ServiceOfficer');
const Technician = require('./Technician');

const ServiceRequest = require('./ServiceRequest');
const ICTSupportRequest = require('./ICTSupportRequest');
const MaintenanceRequest = require('./MaintenanceRequest');
const CleaningRequest = require('./CleaningRequest');
const GeneralServiceRequest = require('./GeneralServiceRequest');

const ServiceRequestManager = require('./ServiceRequestManager');

/**
 * Console entry point for the Campus Service Request Management System.
 *
 * Menu design note: options 1-9 are exactly the Pass-level required menu
 * from the brief, unchanged in wording and order. Options 10+ expose the
 * Credit workflow, Distinction reports and audit trail — functionality
 * that didn't exist yet when the original 10-item menu was specified.
 * Exit has moved from 10 to the final option so the new functionality is
 * actually reachable, per the brief's own requirement that specialised
 * classes and workflow "must provide... behaviour" in the working
 * application, not just exist in source.
 */
class CampusServiceApp {
  #manager;
  #rl;

  constructor() {
    this.#manager = new ServiceRequestManager();
    this.#rl = readline.createInterface({ input, output });
  }

  async start() {
    console.log('====================================================');
    console.log('           CAMPUS SERVICE REQUEST SYSTEM');
    console.log('====================================================');

    try {
      const { usersLoaded, requestsLoaded, auditEntriesLoaded } = await this.#manager.loadAll();
      console.log(
        `Loaded from data/: ${usersLoaded} user(s), ${requestsLoaded} request(s), ` +
        `${auditEntriesLoaded} audit entrie(s).`
      );
    } catch (err) {
      console.log(`Warning: could not load saved data (${err.message}). Starting with an empty system.`);
    }

    let running = true;
    while (running) {
      this.#showMenu();
      const choice = (await this.#rl.question('Select an option: ')).trim();
      try {
        running = await this.#handleChoice(choice);
      } catch (err) {
        console.log(`\nError: ${err.message}`);
      }
    }

    console.log('\nGoodbye!');
    this.#rl.close();
  }

  #showMenu() {
    console.log('\n====================================================');
    console.log('    CAMPUS SERVICE REQUEST SYSTEM');
    console.log('====================================================');
    console.log('1. Register User');
    console.log('2. Submit Service Request');
    console.log('3. View Request by ID');
    console.log('4. View My Requests');
    console.log('5. View All Requests');
    console.log('6. Update My Request');
    console.log('7. Cancel My Request');
    console.log('8. Search Requests');
    console.log('9. View Request Summary');
    console.log('---- Credit workflow (Service Officer / Technician) ----');
    console.log('10. Review Request');
    console.log('11. Assign Priority');
    console.log('12. Assign Technician');
    console.log('13. Begin Work');
    console.log('14. Record Progress');
    console.log('15. Resolve Request');
    console.log('16. Verify & Close Request');
    console.log('---- Distinction: reports & audit ----');
    console.log('17. View Management Reports');
    console.log('18. View Audit Trail for a Request');
    console.log('19. View All Registered Users');
    console.log('20. Exit');
    console.log('====================================================');
  }

  async #handleChoice(choice) {
    switch (choice) {
      case '1': await this.#registerUser(); break;
      case '2': await this.#submitRequest(); break;
      case '3': await this.#viewRequestById(); break;
      case '4': await this.#viewMyRequests(); break;
      case '5': this.#viewAllRequests(); break;
      case '6': await this.#updateMyRequest(); break;
      case '7': await this.#cancelMyRequest(); break;
      case '8': await this.#searchRequests(); break;
      case '9': this.#viewRequestSummary(); break;
      case '10': await this.#reviewRequest(); break;
      case '11': await this.#assignPriority(); break;
      case '12': await this.#assignTechnician(); break;
      case '13': await this.#beginWork(); break;
      case '14': await this.#recordProgress(); break;
      case '15': await this.#resolveRequest(); break;
      case '16': await this.#verifyAndClose(); break;
      case '17': await this.#viewManagementReports(); break;
      case '18': await this.#viewAuditTrail(); break;
      case '19': this.#viewAllUsers(); break;
      case '20': return false;
      default:
        console.log('\nInvalid option. Please choose a number from the menu.');
    }
    return true;
  }

  // ---------- 1-9: Pass-level menu actions ----------

  async #registerUser() {
    console.log('\n--- Register User ---');
    const userId = (await this.#rl.question('User ID: ')).trim();
    const firstName = (await this.#rl.question('First name: ')).trim();
    const lastName = (await this.#rl.question('Last name: ')).trim();
    const email = (await this.#rl.question('Email address: ')).trim();
    const userType = (
      await this.#rl.question(`User type (${User.VALID_USER_TYPES.join('/')}): `)
    ).trim();

    let user;
    switch (userType) {
      case 'Student': {
        const programme = (await this.#rl.question('Programme: ')).trim();
        const yearLevel = parseInt((await this.#rl.question('Year level (1-6): ')).trim(), 10);
        user = new StudentRequester(userId, firstName, lastName, email, programme, yearLevel);
        break;
      }
      case 'Staff': {
        const department = (await this.#rl.question('Department: ')).trim();
        user = new StaffRequester(userId, firstName, lastName, email, department);
        break;
      }
      case 'ServiceOfficer': {
        const serviceSection = (await this.#rl.question('Service section: ')).trim();
        user = new ServiceOfficer(userId, firstName, lastName, email, serviceSection);
        break;
      }
      case 'Technician': {
        const technicalSpeciality = (await this.#rl.question('Technical speciality: ')).trim();
        user = new Technician(userId, firstName, lastName, email, technicalSpeciality);
        break;
      }
      default:
        // Administrator, or anything else — validated properly inside User itself.
        user = new User(userId, firstName, lastName, email, userType);
    }

    await this.#manager.registerUser(user);
    console.log(`\nUser registered successfully:\n${user.displayInfo()}`);
  }

  async #promptSpecialisedFields(category) {
    switch (category) {
      case 'ICT Support':
        return {
          deviceType: (await this.#rl.question('Device type: ')).trim(),
          systemName: (await this.#rl.question('System name: ')).trim(),
          faultType: (await this.#rl.question('Fault type: ')).trim(),
          networkImpact: (
            await this.#rl.question(`Network impact (${ICTSupportRequest.VALID_NETWORK_IMPACTS.join('/')}): `)
          ).trim(),
        };
      case 'Facilities Maintenance':
        return {
          building: (await this.#rl.question('Building: ')).trim(),
          roomNumber: (await this.#rl.question('Room number: ')).trim(),
          hazardLevel: (
            await this.#rl.question(`Hazard level (${MaintenanceRequest.VALID_HAZARD_LEVELS.join('/')}): `)
          ).trim(),
          equipmentAffected: (await this.#rl.question('Equipment affected: ')).trim(),
        };
      case 'Cleaning and Sanitation':
        return {
          cleaningArea: (await this.#rl.question('Cleaning area: ')).trim(),
          hygieneRisk: (
            await this.#rl.question(`Hygiene risk (${CleaningRequest.VALID_HYGIENE_RISKS.join('/')}): `)
          ).trim(),
          serviceType: (await this.#rl.question('Service type: ')).trim(),
          preferredServiceTime: (await this.#rl.question('Preferred service time: ')).trim(),
        };
      case 'General Campus Service':
        return {
          contactPreference: (
            await this.#rl.question(`Contact preference (${GeneralServiceRequest.VALID_CONTACT_PREFERENCES.join('/')}): `)
          ).trim(),
          urgencyReason: (await this.#rl.question('Urgency reason: ')).trim(),
          estimatedDurationMinutes: parseInt(
            (await this.#rl.question('Estimated duration (minutes): ')).trim(), 10
          ),
        };
      default:
        throw new Error(`Unsupported category: "${category}".`);
    }
  }

  #buildSpecialisedRequest(category, requestId, requester, title, description, location, priority, fields) {
    switch (category) {
      case 'ICT Support':
        return new ICTSupportRequest(requestId, requester, title, description, location, priority, fields);
      case 'Facilities Maintenance':
        return new MaintenanceRequest(requestId, requester, title, description, location, priority, fields);
      case 'Cleaning and Sanitation':
        return new CleaningRequest(requestId, requester, title, description, location, priority, fields);
      case 'General Campus Service':
        return new GeneralServiceRequest(requestId, requester, title, description, location, priority, fields);
      default:
        throw new Error(`Unsupported category: "${category}".`);
    }
  }

  async #submitRequest() {
    console.log('\n--- Submit Service Request ---');
    const requesterId = (await this.#rl.question('Your User ID: ')).trim();
    const requester = this.#manager.findUserById(requesterId);
    if (!requester) {
      console.log('No user found with that ID. Please register first (option 1).');
      return;
    }

    const title = (await this.#rl.question('Request title: ')).trim();
    const description = (await this.#rl.question('Description: ')).trim();
    const location = (await this.#rl.question('Campus location: ')).trim();
    const category = (
      await this.#rl.question(`Category (${ServiceRequest.VALID_CATEGORIES.join(' / ')}): `)
    ).trim();
    const priority = (
      await this.#rl.question(`Priority (${ServiceRequest.VALID_PRIORITIES.join(' / ')}): `)
    ).trim();

    const specialisedFields = await this.#promptSpecialisedFields(category);
    const requestId = this.#manager.generateRequestId();
    const request = this.#buildSpecialisedRequest(
      category, requestId, requester, title, description, location, priority, specialisedFields
    );

    await this.#manager.submitRequest(request);
    console.log(`\nRequest submitted successfully:\n${request.getRequestSummary()}`);
  }

  async #viewRequestById() {
    console.log('\n--- View Request by ID ---');
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const request = this.#manager.findRequestById(requestId);
    if (!request) {
      console.log('No request found with that ID.');
      return;
    }
    console.log(`\n${request.getRequestSummary()}`);
  }

  async #viewMyRequests() {
    console.log('\n--- View My Requests ---');
    const userId = (await this.#rl.question('Your User ID: ')).trim();
    const requests = this.#manager.getRequestsByUser(userId);
    if (requests.length === 0) {
      console.log('You have no requests on file.');
      return;
    }
    console.log('');
    requests.forEach((r) => console.log(r.getRequestSummary()));
  }

  #viewAllRequests() {
    console.log('\n--- All Requests ---');
    const requests = this.#manager.getAllRequests();
    if (requests.length === 0) {
      console.log('No requests have been submitted yet.');
      return;
    }
    requests.forEach((r) => console.log(r.getRequestSummary()));
  }

  async #updateMyRequest() {
    console.log('\n--- Update My Request ---');
    const userId = (await this.#rl.question('Your User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID to update: ')).trim();
    console.log('Leave a field blank to keep its current value.');
    const title = (await this.#rl.question('New title: ')).trim();
    const description = (await this.#rl.question('New description: ')).trim();
    const location = (await this.#rl.question('New location: ')).trim();
    const priority = (await this.#rl.question('New priority: ')).trim();

    const changes = {};
    if (title) changes.title = title;
    if (description) changes.description = description;
    if (location) changes.location = location;
    if (priority) changes.priority = priority;

    const request = await this.#manager.updateRequest(requestId, userId, changes);
    console.log(`\nRequest updated:\n${request.getRequestSummary()}`);
  }

  async #cancelMyRequest() {
    console.log('\n--- Cancel My Request ---');
    const userId = (await this.#rl.question('Your User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID to cancel: ')).trim();
    const request = await this.#manager.cancelRequest(requestId, userId);
    console.log(`\nRequest ${request.getRequestId()} has been cancelled.`);
  }

  async #searchRequests() {
    console.log('\n--- Search Requests ---');
    const text = (await this.#rl.question('Search by request ID or title: ')).trim();
    const results = this.#manager.searchRequests(text);
    if (results.length === 0) {
      console.log('No matching requests found.');
      return;
    }
    results.forEach((r) => console.log(r.getRequestSummary()));
  }

  #viewRequestSummary() {
    console.log('\n--- Request Summary by Status ---');
    const summary = this.#manager.getRequestSummaryByStatus();
    const statuses = Object.keys(summary);
    if (statuses.length === 0) {
      console.log('No requests have been submitted yet.');
      return;
    }
    statuses.forEach((status) => console.log(`${status}: ${summary[status]}`));
  }

  // ---------- 10-16: Credit workflow actions ----------

  async #reviewRequest() {
    console.log('\n--- Review Request (Service Officer) ---');
    const officerId = (await this.#rl.question('Your Service Officer User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const comment = (await this.#rl.question('Comment (optional): ')).trim();
    const request = await this.#manager.reviewRequest(requestId, officerId, comment || undefined);
    console.log(`\nRequest ${request.getRequestId()} status is now: ${request.getStatus()}`);
  }

  async #assignPriority() {
    console.log('\n--- Assign Priority (Service Officer) ---');
    const officerId = (await this.#rl.question('Your Service Officer User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const priority = (
      await this.#rl.question(`New priority (${ServiceRequest.VALID_PRIORITIES.join(' / ')}): `)
    ).trim();
    const comment = (await this.#rl.question('Comment (optional): ')).trim();
    const request = await this.#manager.assignPriority(requestId, officerId, priority, comment || undefined);
    console.log(`\nRequest ${request.getRequestId()} priority is now: ${request.getPriority()}`);
  }

  async #assignTechnician() {
    console.log('\n--- Assign Technician (Service Officer) ---');
    const officerId = (await this.#rl.question('Your Service Officer User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const technicianId = (await this.#rl.question('Technician User ID: ')).trim();
    const comment = (await this.#rl.question('Comment (optional): ')).trim();
    const request = await this.#manager.assignTechnician(requestId, officerId, technicianId, comment || undefined);
    console.log(`\nRequest ${request.getRequestId()} status is now: ${request.getStatus()} (assigned to ${technicianId})`);
  }

  async #beginWork() {
    console.log('\n--- Begin Work (Technician) ---');
    const technicianId = (await this.#rl.question('Your Technician User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const comment = (await this.#rl.question('Comment (optional): ')).trim();
    const request = await this.#manager.beginWork(requestId, technicianId, comment || undefined);
    console.log(`\nRequest ${request.getRequestId()} status is now: ${request.getStatus()}`);
  }

  async #recordProgress() {
    console.log('\n--- Record Progress (Technician) ---');
    const technicianId = (await this.#rl.question('Your Technician User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const comment = (await this.#rl.question('Progress note: ')).trim();
    await this.#manager.recordProgress(requestId, technicianId, comment);
    console.log(`\nProgress note recorded for request ${requestId}.`);
  }

  async #resolveRequest() {
    console.log('\n--- Resolve Request (Technician) ---');
    const technicianId = (await this.#rl.question('Your Technician User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const comment = (await this.#rl.question('Resolution note (optional): ')).trim();
    const request = await this.#manager.resolveRequest(requestId, technicianId, comment || undefined);
    console.log(`\nRequest ${request.getRequestId()} status is now: ${request.getStatus()}`);
  }

  async #verifyAndClose() {
    console.log('\n--- Verify & Close Request (Service Officer) ---');
    const officerId = (await this.#rl.question('Your Service Officer User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID: ')).trim();
    const comment = (await this.#rl.question('Comment (optional): ')).trim();
    const request = await this.#manager.verifyAndClose(requestId, officerId, comment || undefined);
    console.log(`\nRequest ${request.getRequestId()} status is now: ${request.getStatus()}`);
  }

  // ---------- 17-19: Distinction reports & audit ----------

  async #viewManagementReports() {
    console.log('\n--- Management Reports ---');
    console.log('1. Requests grouped by status');
    console.log('2. Requests grouped by category');
    console.log('3. Requests grouped by priority');
    console.log('4. Urgent requests');
    console.log('5. Overdue requests');
    console.log('6. Requests assigned to a Technician');
    console.log('7. Completed requests by Technician');
    console.log('8. Average resolution time');
    console.log('9. Request volume by location');
    const choice = (await this.#rl.question('Select a report: ')).trim();

    switch (choice) {
      case '1':
        console.log(this.#manager.getRequestSummaryByStatus());
        break;
      case '2':
        console.log(this.#manager.getRequestsGroupedByCategory());
        break;
      case '3':
        console.log(this.#manager.getRequestsGroupedByPriority());
        break;
      case '4':
        this.#manager.getUrgentRequests().forEach((r) => console.log(r.getRequestSummary()));
        break;
      case '5': {
        const overdue = this.#manager.getOverdueRequests();
        if (overdue.length === 0) console.log('No overdue requests.');
        overdue.forEach((r) => console.log(r.getRequestSummary()));
        break;
      }
      case '6': {
        const technicianId = (await this.#rl.question('Technician User ID: ')).trim();
        this.#manager.getRequestsAssignedToTechnician(technicianId).forEach((r) => console.log(r.getRequestSummary()));
        break;
      }
      case '7': {
        const technicianId = (await this.#rl.question('Technician User ID: ')).trim();
        this.#manager.getCompletedRequestsByTechnician(technicianId).forEach((r) => console.log(r.getRequestSummary()));
        break;
      }
      case '8':
        console.log(`Average resolution time: ${this.#manager.getAverageResolutionTimeHours()} hours`);
        break;
      case '9':
        console.log(this.#manager.getRequestVolumeByLocation());
        break;
      default:
        console.log('Invalid report choice.');
    }
  }

  async #viewAuditTrail() {
    console.log('\n--- Audit Trail ---');
    const requestId = (await this.#rl.question('Request ID (leave blank for the full audit log): ')).trim();
    const entries = requestId
      ? this.#manager.getAuditLogForRequest(requestId)
      : this.#manager.getAuditLog();

    if (entries.length === 0) {
      console.log('No audit entries found.');
      return;
    }
    entries.forEach((e) =>
      console.log(`[${e.auditId}] ${e.dateTime} - ${e.actorId} - ${e.actionPerformed} - ${e.description} (${e.result})`)
    );
  }

  #viewAllUsers() {
    console.log('\n--- All Registered Users ---');
    const users = this.#manager.getAllUsers();
    if (users.length === 0) {
      console.log('No users registered yet.');
      return;
    }
    users.forEach((u) => console.log(`${u.getUserId()} - ${u.getFullName()} (${u.getUserType()})`));
  }
}

module.exports = CampusServiceApp;

// Allow running directly: node src/CampusServiceApp.js
if (require.main === module) {
  const app = new CampusServiceApp();
  app.start();
}
