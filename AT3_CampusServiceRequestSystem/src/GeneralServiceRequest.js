'use strict';

const ServiceRequest = require('./ServiceRequest');

/**
 * A campus service request that doesn't fit ICT, Maintenance or Cleaning —
 * general campus service issues. Extends ServiceRequest via constructor
 * chaining (super()) and fixes its category to "General Campus Service".
 *
 * Added beyond the brief's minimum three specialised classes so that every
 * request category has a concrete subclass. This matters once
 * ServiceRequest becomes an abstract-style base (Week 13, Distinction) —
 * without a fourth subclass, a "General Campus Service" request would have
 * nowhere to live except the now-abstract base class, and any report that
 * called getTargetResolutionHours() or calculatePriorityScore() on it
 * would crash.
 */
class GeneralServiceRequest extends ServiceRequest {
  #contactPreference;
  #urgencyReason;
  #estimatedDurationMinutes;

  static VALID_CONTACT_PREFERENCES = ['Email', 'Phone', 'In Person'];

  constructor(requestId, requester, title, description, location, priority, specialisedData = {}) {
    super(requestId, requester, title, description, location, 'General Campus Service', priority);

    const { contactPreference, urgencyReason, estimatedDurationMinutes } = specialisedData;
    this.#contactPreference = contactPreference;
    this.#urgencyReason = urgencyReason;
    this.#estimatedDurationMinutes = estimatedDurationMinutes;

    this.validate();
  }

  getContactPreference() { return this.#contactPreference; }
  getUrgencyReason() { return this.#urgencyReason; }
  getEstimatedDurationMinutes() { return this.#estimatedDurationMinutes; }

  validate() {
    super.validate();
    if (!GeneralServiceRequest.VALID_CONTACT_PREFERENCES.includes(this.#contactPreference)) {
      throw new Error(
        `Unsupported contact preference: "${this.#contactPreference}". ` +
        `Must be one of: ${GeneralServiceRequest.VALID_CONTACT_PREFERENCES.join(', ')}.`
      );
    }
    if (!this.#urgencyReason || !String(this.#urgencyReason).trim()) {
      throw new Error('Urgency reason is required for a general service request.');
    }
    if (!Number.isFinite(this.#estimatedDurationMinutes) || this.#estimatedDurationMinutes <= 0) {
      throw new Error('Estimated duration (minutes) must be a positive number.');
    }
    return true;
  }

  // ---------- Overridden (polymorphic) behaviour ----------

  getRequestSummary() {
    return (
      `${this.getCommonSummaryLine()} | Contact: ${this.#contactPreference} ` +
      `- Reason: ${this.#urgencyReason} - Est. duration: ${this.#estimatedDurationMinutes} min`
    );
  }

  calculatePriorityScore() {
    const priorityScores = { Low: 1, Normal: 2, High: 3, Urgent: 4 };
    return priorityScores[this.getPriority()];
  }

  getTargetResolutionHours() {
    const byPriority = { Urgent: 24, High: 48, Normal: 96, Low: 168 };
    return byPriority[this.getPriority()];
  }

  getSpecialisedFields() {
    return {
      contactPreference: this.#contactPreference,
      urgencyReason: this.#urgencyReason,
      estimatedDurationMinutes: this.#estimatedDurationMinutes,
    };
  }
}

module.exports = GeneralServiceRequest;
