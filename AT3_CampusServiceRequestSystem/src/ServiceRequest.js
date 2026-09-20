'use strict';

/**
 * Represents a single campus service request at Pass level.
 *
 * Specialised subclasses (ICTSupportRequest, MaintenanceRequest,
 * CleaningRequest) extend this class from week 11 (Credit), overriding
 * getRequestSummary() and adding calculatePriorityScore() /
 * getTargetResolutionHours() at Distinction (Week 13).
 */
class ServiceRequest {
  #requestId;
  #requester;
  #title;
  #description;
  #location;
  #category;
  #priority;
  #status;
  #assignedTechnicianId;
  #dateSubmitted;
  #dateUpdated;
  #history; 

  static VALID_CATEGORIES = [
    'ICT Support',
    'Facilities Maintenance',
    'Cleaning and Sanitation',
    'General Campus Service',
  ];

  static VALID_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

  // Full Credit-level status set. Cancelled is a final status (no
  // transitions out of it), matching the Permitted Status Flow in the brief.
  static VALID_STATUSES = [
    'Submitted',
    'Reviewed',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
    'Cancelled',
  ];

  // Allowed forward transitions. Any transition not listed here is rejected
  // by #transitionTo() with a clear error message.
  static ALLOWED_TRANSITIONS = {
    Submitted: ['Reviewed', 'Cancelled'],
    Reviewed: ['Assigned'],
    Assigned: ['In Progress'],
    'In Progress': ['Resolved'],
    Resolved: ['Closed'],
    Closed: [],
    Cancelled: [],
  };

  constructor(requestId, requester, title, description, location, category, priority) {
    this.#requestId = requestId;
    this.#requester = requester;
    this.#title = title;
    this.#description = description;
    this.#location = location;
    this.#category = category;
    this.#priority = priority;
    this.#status = 'Submitted';
    this.#assignedTechnicianId = null;
    this.#dateSubmitted = new Date();
    this.#dateUpdated = new Date();
    this.#history = [];

    // Fail fast: an invalid request should never be constructable.
    // See User.js for why this calls the private helper, not the public
    // overridable validate() — subclass private fields don't exist yet
    // while we're still inside this (base) constructor.
    this.#validateOwnFields();

    this.#history.push({
      previousStatus: null,
      newStatus: this.#status,
      actionPerformed: 'Request submitted',
      actorId: this.#requester.getUserId(),
      comment: 'Initial submission',
      dateTime: this.#dateSubmitted,
    });
  }

  // ---------- Getters ----------
  getRequestId() { return this.#requestId; }
  getRequester() { return this.#requester; }
  getTitle() { return this.#title; }
  getDescription() { return this.#description; }
  getLocation() { return this.#location; }
  getCategory() { return this.#category; }
  getPriority() { return this.#priority; }
  getStatus() { return this.#status; }
  getAssignedTechnicianId() { return this.#assignedTechnicianId; }
  getDateSubmitted() { return this.#dateSubmitted; }
  getDateUpdated() { return this.#dateUpdated; }
  getHistory() { return [...this.#history]; } // return a copy — no external mutation

  /**
   * Validates all base ServiceRequest fields. Private and NOT overridable —
   * always checks exactly the fields declared on ServiceRequest. Safe to
   * call from the constructor before subclass fields exist.
   */
  #validateOwnFields() {
    if (!this.#requestId || !String(this.#requestId).trim()) {
      throw new Error('Request ID is required.');
    }
    if (!this.#requester) {
      throw new Error('A requester is required to submit a request.');
    }
    if (!this.#title || !String(this.#title).trim()) {
      throw new Error('Request title is required.');
    }
    if (!this.#description || !String(this.#description).trim()) {
      throw new Error('Request description is required.');
    }
    if (!this.#location || !String(this.#location).trim()) {
      throw new Error('Campus location is required.');
    }
    if (!ServiceRequest.VALID_CATEGORIES.includes(this.#category)) {
      throw new Error(
        `Unsupported category: "${this.#category}". ` +
        `Must be one of: ${ServiceRequest.VALID_CATEGORIES.join(', ')}.`
      );
    }
    if (!ServiceRequest.VALID_PRIORITIES.includes(this.#priority)) {
      throw new Error(
        `Unsupported priority: "${this.#priority}". ` +
        `Must be one of: ${ServiceRequest.VALID_PRIORITIES.join(', ')}.`
      );
    }
    return true;
  }

  /**
   * Public, overridable validation entry point. Specialised subclasses
   * override this to call super.validate() plus their own field checks,
   * and call it themselves explicitly at the end of their own constructor.
   */
  validate() {
    return this.#validateOwnFields();
  }

  // ---------- Behaviour ----------

  /**
   * Requester-only update, permitted only while the request is Submitted.
   * NOTE: ownership checking (is the caller the request's own requester?)
   * belongs to ServiceRequestManager (Week 9) — this class only enforces
   * status-based rules it can verify on its own.
   */
  updateDetails(changes = {}) {
    if (this.#status !== 'Submitted') {
      throw new Error(
        `Cannot update request ${this.#requestId}: only Submitted requests can be updated.`
      );
    }

    const previousTitle = this.#title;
    const previousDescription = this.#description;
    const previousLocation = this.#location;
    const previousCategory = this.#category;
    const previousPriority = this.#priority;

    if (changes.title !== undefined) this.#title = changes.title;
    if (changes.description !== undefined) this.#description = changes.description;
    if (changes.location !== undefined) this.#location = changes.location;
    if (changes.category !== undefined) this.#category = changes.category;
    if (changes.priority !== undefined) this.#priority = changes.priority;

    try {
      this.validate();
    } catch (err) {
      // Roll back so the object never ends up in an invalid state.
      this.#title = previousTitle;
      this.#description = previousDescription;
      this.#location = previousLocation;
      this.#category = previousCategory;
      this.#priority = previousPriority;
      throw err;
    }

    this.#dateUpdated = new Date();
    this.#history.push({
      previousStatus: this.#status,
      newStatus: this.#status,
      actionPerformed: 'Request details updated',
      actorId: this.#requester.getUserId(),
      comment: 'Requester updated request details',
      dateTime: this.#dateUpdated,
    });

    return true;
  }

  cancelRequest() {
    if (this.#status === 'Cancelled') {
      throw new Error(`Request ${this.#requestId} is already Cancelled.`);
    }
    if (this.#status !== 'Submitted') {
      throw new Error(
        `Cannot cancel request ${this.#requestId}: only Submitted requests can be cancelled at Pass level.`
      );
    }

    const previousStatus = this.#status;
    this.#status = 'Cancelled';
    this.#dateUpdated = new Date();

    this.#history.push({
      previousStatus,
      newStatus: this.#status,
      actionPerformed: 'Request cancelled',
      actorId: this.#requester.getUserId(),
      comment: 'Cancelled by requester',
      dateTime: this.#dateUpdated,
    });

    return true;
  }

  // ---------- Controlled workflow (Credit) ----------
  //
  // NOTE ON PERMISSIONS: this class enforces STATUS-based rules only (is
  // this transition legal from the current status?). It does not know
  // about user roles. Role permission checks (only a Service Officer may
  // review/assign, only the assigned Technician may work their own job)
  // belong to ServiceRequestManager, which has access to the User records
  // needed to check a role. Each method below accepts the actorId purely
  // for the history record — callers are expected to have already checked
  // permissions before calling.

  /**
   * Internal, single point of truth for changing status. Validates the
   * transition against ALLOWED_TRANSITIONS and records a history entry.
   */
  #transitionTo(newStatus, actorId, actionPerformed, comment) {
    const allowedNext = ServiceRequest.ALLOWED_TRANSITIONS[this.#status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new Error(
        `Invalid status transition for request ${this.#requestId}: ` +
        `cannot move from "${this.#status}" to "${newStatus}".`
      );
    }

    const previousStatus = this.#status;
    this.#status = newStatus;
    this.#dateUpdated = new Date();

    this.#history.push({
      previousStatus,
      newStatus: this.#status,
      actionPerformed,
      actorId,
      comment: comment || actionPerformed,
      dateTime: this.#dateUpdated,
    });

    return true;
  }

  /** Service Officer reviews a Submitted request. */
  reviewRequest(actorId, comment) {
    return this.#transitionTo('Reviewed', actorId, 'Request reviewed', comment);
  }

  /**
   * Service Officer sets/confirms the authoritative priority during
   * review. Only permitted once the request has been Reviewed and before
   * it is Assigned, so priority is settled before work is handed out.
   */
  assignPriority(priority, actorId, comment) {
    if (this.#status !== 'Reviewed') {
      throw new Error(
        `Cannot assign priority for request ${this.#requestId}: request must be Reviewed first ` +
        `(current status: "${this.#status}").`
      );
    }
    if (!ServiceRequest.VALID_PRIORITIES.includes(priority)) {
      throw new Error(
        `Unsupported priority: "${priority}". ` +
        `Must be one of: ${ServiceRequest.VALID_PRIORITIES.join(', ')}.`
      );
    }

    const previousPriority = this.#priority;
    this.#priority = priority;
    this.#dateUpdated = new Date();

    this.#history.push({
      previousStatus: this.#status,
      newStatus: this.#status,
      actionPerformed: 'Priority assigned',
      actorId,
      comment: comment || `Priority changed from ${previousPriority} to ${priority}`,
      dateTime: this.#dateUpdated,
    });

    return true;
  }

  /** Service Officer assigns a Technician and moves the request to Assigned. */
  assignTechnician(technicianId, actorId, comment) {
    if (!technicianId || !String(technicianId).trim()) {
      throw new Error('A technician ID is required to assign this request.');
    }
    this.#assignedTechnicianId = technicianId;
    return this.#transitionTo(
      'Assigned',
      actorId,
      `Technician ${technicianId} assigned`,
      comment
    );
  }

  /** The assigned Technician begins work. */
  beginWork(actorId, comment) {
    return this.#transitionTo('In Progress', actorId, 'Work started', comment);
  }

  /**
   * The assigned Technician records a progress note without changing
   * status. Only permitted while work is In Progress.
   */
  recordProgress(comment, actorId) {
    if (this.#status !== 'In Progress') {
      throw new Error(
        `Cannot record progress for request ${this.#requestId}: request is not In Progress ` +
        `(current status: "${this.#status}").`
      );
    }
    if (!comment || !String(comment).trim()) {
      throw new Error('A progress comment is required.');
    }

    this.#dateUpdated = new Date();
    this.#history.push({
      previousStatus: this.#status,
      newStatus: this.#status,
      actionPerformed: 'Progress recorded',
      actorId,
      comment,
      dateTime: this.#dateUpdated,
    });

    return true;
  }

  /** The assigned Technician resolves the request. */
  resolveRequest(actorId, comment) {
    return this.#transitionTo('Resolved', actorId, 'Request resolved', comment);
  }

  /** Service Officer verifies and closes a Resolved request. */
  verifyAndClose(actorId, comment) {
    return this.#transitionTo('Closed', actorId, 'Request verified and closed', comment);
  }

  getRequestSummary() {
    return (
      `[${this.#requestId}] ${this.#title} (${this.#category}, ${this.#priority}) ` +
      `- Status: ${this.#status} - Requested by: ${this.#requester.getFullName()} ` +
      `- Location: ${this.#location}`
    );
  }
}

module.exports = ServiceRequest;
