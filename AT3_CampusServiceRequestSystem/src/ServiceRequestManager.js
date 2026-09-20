'use strict';

const User = require('./User');
const ServiceRequest = require('./ServiceRequest');

/**
 * Manages all registered Users and submitted ServiceRequests using plain
 * JavaScript arrays (no database — per the Pass/Credit requirement).
 *
 * This class owns ownership/permission rules that ServiceRequest cannot
 * verify on its own (e.g. "is this the request's own requester?"). Console
 * menu code (CampusServiceApp) must go through this class rather than
 * touching the arrays directly.
 */
class ServiceRequestManager {
  #users;
  #requests;

  constructor() {
    this.#users = [];
    this.#requests = [];
  }

  // ---------- User management ----------

  registerUser(user) {
    if (!(user instanceof User)) {
      throw new TypeError('registerUser() requires a User instance.');
    }
    if (this.findUserById(user.getUserId())) {
      throw new Error(`Duplicate user ID: "${user.getUserId()}" is already registered.`);
    }
    this.#users.push(user);
    return user;
  }

  findUserById(userId) {
    return this.#users.find((u) => u.getUserId() === userId) || null;
  }

  getAllUsers() {
    return [...this.#users];
  }

  // ---------- Request management ----------

  submitRequest(request) {
    if (!(request instanceof ServiceRequest)) {
      throw new TypeError('submitRequest() requires a ServiceRequest instance.');
    }
    if (this.findRequestById(request.getRequestId())) {
      throw new Error(`Duplicate request ID: "${request.getRequestId()}" already exists.`);
    }
    this.#requests.push(request);
    return request;
  }

  findRequestById(requestId) {
    return this.#requests.find((r) => r.getRequestId() === requestId) || null;
  }

  getRequestsByUser(userId) {
    return this.#requests.filter((r) => r.getRequester().getUserId() === userId);
  }

  getAllRequests() {
    return [...this.#requests];
  }

  /**
   * Requester-only update. Rejects the update if requestId does not exist
   * or does not belong to the calling userId.
   */
  updateRequest(requestId, userId, changes) {
    const request = this.findRequestById(requestId);
    if (!request) {
      throw new Error(`No request found with ID "${requestId}".`);
    }
    if (request.getRequester().getUserId() !== userId) {
      throw new Error(
        `User "${userId}" is not permitted to update request "${requestId}" — it belongs to another user.`
      );
    }
    request.updateDetails(changes);
    return request;
  }

  /**
   * Requester-only cancellation. Rejects if requestId does not exist or
   * does not belong to the calling userId (ServiceRequest itself rejects
   * cancelling an already-Cancelled request).
   */
  cancelRequest(requestId, userId) {
    const request = this.findRequestById(requestId);
    if (!request) {
      throw new Error(`No request found with ID "${requestId}".`);
    }
    if (request.getRequester().getUserId() !== userId) {
      throw new Error(
        `User "${userId}" is not permitted to cancel request "${requestId}" — it belongs to another user.`
      );
    }
    request.cancelRequest();
    return request;
  }

  searchRequests(searchText) {
    const text = String(searchText || '').toLowerCase().trim();
    if (!text) return [];
    return this.#requests.filter(
      (r) =>
        r.getRequestId().toLowerCase().includes(text) ||
        r.getTitle().toLowerCase().includes(text)
    );
  }

  getRequestSummaryByStatus() {
    const summary = {};
    for (const request of this.#requests) {
      const status = request.getStatus();
      summary[status] = (summary[status] || 0) + 1;
    }
    return summary;
  }

  // ---------- Controlled workflow with role permissions (Credit) ----------
  //
  // ServiceRequest enforces status-based rules; this layer enforces WHO is
  // allowed to trigger each transition, per the brief's Role Permissions:
  //   - Only a Service Officer may review requests.
  //   - Only a Service Officer may assign a Technician.
  //   - Only the assigned Technician may start or resolve the work.
  //   - Only a Service Officer may close a Resolved request.

  #requireRequest(requestId) {
    const request = this.findRequestById(requestId);
    if (!request) {
      throw new Error(`No request found with ID "${requestId}".`);
    }
    return request;
  }

  #requireUserOfType(userId, expectedType, actionDescription) {
    const user = this.findUserById(userId);
    if (!user) {
      throw new Error(`No user found with ID "${userId}".`);
    }
    if (user.getUserType() !== expectedType) {
      throw new Error(
        `User "${userId}" is a ${user.getUserType()} and is not permitted to ${actionDescription} ` +
        `— only a ${expectedType} may do this.`
      );
    }
    return user;
  }

  reviewRequest(requestId, officerId, comment) {
    this.#requireUserOfType(officerId, 'ServiceOfficer', 'review requests');
    const request = this.#requireRequest(requestId);
    request.reviewRequest(officerId, comment);
    return request;
  }

  assignPriority(requestId, officerId, priority, comment) {
    this.#requireUserOfType(officerId, 'ServiceOfficer', 'assign priority');
    const request = this.#requireRequest(requestId);
    request.assignPriority(priority, officerId, comment);
    return request;
  }

  assignTechnician(requestId, officerId, technicianId, comment) {
    this.#requireUserOfType(officerId, 'ServiceOfficer', 'assign a technician');
    this.#requireUserOfType(technicianId, 'Technician', 'be assigned to a request');
    const request = this.#requireRequest(requestId);
    request.assignTechnician(technicianId, officerId, comment);
    return request;
  }

  #requireAssignedTechnician(request, technicianId, actionDescription) {
    this.#requireUserOfType(technicianId, 'Technician', actionDescription);
    if (request.getAssignedTechnicianId() !== technicianId) {
      throw new Error(
        `Technician "${technicianId}" is not permitted to ${actionDescription} on request ` +
        `"${request.getRequestId()}" — it is assigned to a different technician.`
      );
    }
  }

  beginWork(requestId, technicianId, comment) {
    const request = this.#requireRequest(requestId);
    this.#requireAssignedTechnician(request, technicianId, 'begin work');
    request.beginWork(technicianId, comment);
    return request;
  }

  recordProgress(requestId, technicianId, comment) {
    const request = this.#requireRequest(requestId);
    this.#requireAssignedTechnician(request, technicianId, 'record progress');
    request.recordProgress(comment, technicianId);
    return request;
  }

  resolveRequest(requestId, technicianId, comment) {
    const request = this.#requireRequest(requestId);
    this.#requireAssignedTechnician(request, technicianId, 'resolve this request');
    request.resolveRequest(technicianId, comment);
    return request;
  }

  verifyAndClose(requestId, officerId, comment) {
    this.#requireUserOfType(officerId, 'ServiceOfficer', 'verify and close a request');
    const request = this.#requireRequest(requestId);
    request.verifyAndClose(officerId, comment);
    return request;
  }

  // ---------- Helpers ----------

  /**
   * Generates the next sequential request ID (REQ001, REQ002, ...).
   * Used by CampusServiceApp so requesters never have to invent IDs
   * themselves, which avoids most duplicate-ID errors by construction.
   */
  generateRequestId() {
    let max = 0;
    for (const r of this.#requests) {
      const match = /^REQ(\d+)$/.exec(r.getRequestId());
      if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    return `REQ${String(max + 1).padStart(3, '0')}`;
  }
}

module.exports = ServiceRequestManager;
