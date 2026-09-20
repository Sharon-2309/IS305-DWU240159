'use strict';

const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const User = require('./User');
const ServiceRequest = require('./ServiceRequest');
const ServiceRequestManager = require('./ServiceRequestManager');

/**
 * Console entry point for the Campus Service Request Management System.
 * Implements the required Pass-level menu exactly as specified in the
 * assignment brief.
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

    let running = true;
    while (running) {
      this.#showMenu();
      const choice = (await this.#rl.question('Select an option (1-10): ')).trim();
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
    console.log('10. Exit');
    console.log('====================================================');
  }

  async #handleChoice(choice) {
    switch (choice) {
      case '1':
        await this.#registerUser();
        break;
      case '2':
        await this.#submitRequest();
        break;
      case '3':
        await this.#viewRequestById();
        break;
      case '4':
        await this.#viewMyRequests();
        break;
      case '5':
        this.#viewAllRequests();
        break;
      case '6':
        await this.#updateMyRequest();
        break;
      case '7':
        await this.#cancelMyRequest();
        break;
      case '8':
        await this.#searchRequests();
        break;
      case '9':
        this.#viewRequestSummary();
        break;
      case '10':
        return false;
      default:
        console.log('\nInvalid option. Please choose a number from 1 to 10.');
    }
    return true;
  }

  // ---------- Menu actions ----------

  async #registerUser() {
    console.log('\n--- Register User ---');
    const userId = (await this.#rl.question('User ID: ')).trim();
    const firstName = (await this.#rl.question('First name: ')).trim();
    const lastName = (await this.#rl.question('Last name: ')).trim();
    const email = (await this.#rl.question('Email address: ')).trim();
    const userType = (
      await this.#rl.question(`User type (${User.VALID_USER_TYPES.join('/')}): `)
    ).trim();

    const user = new User(userId, firstName, lastName, email, userType);
    this.#manager.registerUser(user);
    console.log(`\nUser registered successfully:\n${user.displayInfo()}`);
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

    const requestId = this.#manager.generateRequestId();
    const request = new ServiceRequest(
      requestId,
      requester,
      title,
      description,
      location,
      category,
      priority
    );
    this.#manager.submitRequest(request);
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
    const category = (await this.#rl.question('New category: ')).trim();
    const priority = (await this.#rl.question('New priority: ')).trim();

    const changes = {};
    if (title) changes.title = title;
    if (description) changes.description = description;
    if (location) changes.location = location;
    if (category) changes.category = category;
    if (priority) changes.priority = priority;

    const request = this.#manager.updateRequest(requestId, userId, changes);
    console.log(`\nRequest updated:\n${request.getRequestSummary()}`);
  }

  async #cancelMyRequest() {
    console.log('\n--- Cancel My Request ---');
    const userId = (await this.#rl.question('Your User ID: ')).trim();
    const requestId = (await this.#rl.question('Request ID to cancel: ')).trim();
    const request = this.#manager.cancelRequest(requestId, userId);
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
}

module.exports = CampusServiceApp;

// Allow running directly: node src/CampusServiceApp.js
if (require.main === module) {
  const app = new CampusServiceApp();
  app.start();
}
