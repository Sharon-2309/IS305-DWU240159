'use strict';

const ServiceRequest = require('./ServiceRequest');

/**
 * A campus service request for cleaning and sanitation. Extends
 * ServiceRequest via constructor chaining (super()) and fixes its
 * category to "Cleaning and Sanitation".
 */
class CleaningRequest extends ServiceRequest {
  #cleaningArea;
  #hygieneRisk;
  #serviceType;
  #preferredServiceTime;

  static VALID_HYGIENE_RISKS = ['Low', 'Medium', 'High'];

  constructor(requestId, requester, title, description, location, priority, specialisedData = {}) {
    super(requestId, requester, title, description, location, 'Cleaning and Sanitation', priority);

    const { cleaningArea, hygieneRisk, serviceType, preferredServiceTime } = specialisedData;
    this.#cleaningArea = cleaningArea;
    this.#hygieneRisk = hygieneRisk;
    this.#serviceType = serviceType;
    this.#preferredServiceTime = preferredServiceTime;

    this.validate();
  }

  getCleaningArea() { return this.#cleaningArea; }
  getHygieneRisk() { return this.#hygieneRisk; }
  getServiceType() { return this.#serviceType; }
  getPreferredServiceTime() { return this.#preferredServiceTime; }

  validate() {
    super.validate();
    if (!this.#cleaningArea || !String(this.#cleaningArea).trim()) {
      throw new Error('Cleaning area is required for a cleaning request.');
    }
    if (!CleaningRequest.VALID_HYGIENE_RISKS.includes(this.#hygieneRisk)) {
      throw new Error(
        `Unsupported hygiene risk: "${this.#hygieneRisk}". ` +
        `Must be one of: ${CleaningRequest.VALID_HYGIENE_RISKS.join(', ')}.`
      );
    }
    if (!this.#serviceType || !String(this.#serviceType).trim()) {
      throw new Error('Service type is required for a cleaning request.');
    }
    if (!this.#preferredServiceTime || !String(this.#preferredServiceTime).trim()) {
      throw new Error('Preferred service time is required for a cleaning request.');
    }
    return true;
  }

  // ---------- Overridden (polymorphic) behaviour ----------

  getRequestSummary() {
    return (
      `${super.getRequestSummary()} | Area: ${this.#cleaningArea} - Hygiene risk: ${this.#hygieneRisk} ` +
      `- Type: ${this.#serviceType} - Preferred time: ${this.#preferredServiceTime}`
    );
  }

  calculatePriorityScore() {
    const priorityScores = { Low: 1, Normal: 2, High: 3, Urgent: 4 };
    const riskScores = { Low: 0, Medium: 1, High: 3 };
    return priorityScores[this.getPriority()] + riskScores[this.#hygieneRisk];
  }

  getTargetResolutionHours() {
    if (this.#hygieneRisk === 'High') return 6;
    const byPriority = { Urgent: 6, High: 24, Normal: 48, Low: 96 };
    return byPriority[this.getPriority()];
  }
}

module.exports = CleaningRequest;
