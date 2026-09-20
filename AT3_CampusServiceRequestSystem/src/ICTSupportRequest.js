'use strict';

const ServiceRequest = require('./ServiceRequest');

/**
 * A campus service request for an ICT fault. Extends ServiceRequest via
 * constructor chaining (super()) and fixes its category to "ICT Support".
 */
class ICTSupportRequest extends ServiceRequest {
  #deviceType;
  #systemName;
  #faultType;
  #networkImpact;

  static VALID_NETWORK_IMPACTS = ['None', 'Partial', 'Full Outage'];

  constructor(requestId, requester, title, description, location, priority, specialisedData = {}) {
    super(requestId, requester, title, description, location, 'ICT Support', priority);

    const { deviceType, systemName, faultType, networkImpact } = specialisedData;
    this.#deviceType = deviceType;
    this.#systemName = systemName;
    this.#faultType = faultType;
    this.#networkImpact = networkImpact;

    // Safe now — super() has returned, so this subclass's own fields exist.
    this.validate();
  }

  getDeviceType() { return this.#deviceType; }
  getSystemName() { return this.#systemName; }
  getFaultType() { return this.#faultType; }
  getNetworkImpact() { return this.#networkImpact; }

  validate() {
    super.validate();
    if (!this.#deviceType || !String(this.#deviceType).trim()) {
      throw new Error('Device type is required for an ICT support request.');
    }
    if (!this.#systemName || !String(this.#systemName).trim()) {
      throw new Error('System name is required for an ICT support request.');
    }
    if (!this.#faultType || !String(this.#faultType).trim()) {
      throw new Error('Fault type is required for an ICT support request.');
    }
    if (!ICTSupportRequest.VALID_NETWORK_IMPACTS.includes(this.#networkImpact)) {
      throw new Error(
        `Unsupported network impact: "${this.#networkImpact}". ` +
        `Must be one of: ${ICTSupportRequest.VALID_NETWORK_IMPACTS.join(', ')}.`
      );
    }
    return true;
  }

  // ---------- Overridden (polymorphic) behaviour ----------

  getRequestSummary() {
    return (
      `${super.getRequestSummary()} | Device: ${this.#deviceType} (${this.#systemName}) ` +
      `- Fault: ${this.#faultType} - Network impact: ${this.#networkImpact}`
    );
  }

  calculatePriorityScore() {
    const priorityScores = { Low: 1, Normal: 2, High: 3, Urgent: 4 };
    const impactScores = { None: 0, Partial: 1, 'Full Outage': 3 };
    return priorityScores[this.getPriority()] + impactScores[this.#networkImpact];
  }

  getTargetResolutionHours() {
    if (this.#networkImpact === 'Full Outage') return 4;
    const byPriority = { Urgent: 4, High: 12, Normal: 48, Low: 96 };
    return byPriority[this.getPriority()];
  }
}

module.exports = ICTSupportRequest;
