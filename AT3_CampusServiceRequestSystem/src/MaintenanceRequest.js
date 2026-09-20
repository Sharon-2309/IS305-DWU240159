'use strict';

const ServiceRequest = require('./ServiceRequest');

/**
 * A campus service request for facilities maintenance (damage, hazards,
 * broken equipment). Extends ServiceRequest via constructor chaining
 * (super()) and fixes its category to "Facilities Maintenance".
 */
class MaintenanceRequest extends ServiceRequest {
  #building;
  #roomNumber;
  #hazardLevel;
  #equipmentAffected;

  static VALID_HAZARD_LEVELS = ['Low', 'Medium', 'High'];

  constructor(requestId, requester, title, description, location, priority, specialisedData = {}) {
    super(requestId, requester, title, description, location, 'Facilities Maintenance', priority);

    const { building, roomNumber, hazardLevel, equipmentAffected } = specialisedData;
    this.#building = building;
    this.#roomNumber = roomNumber;
    this.#hazardLevel = hazardLevel;
    this.#equipmentAffected = equipmentAffected;

    this.validate();
  }

  getBuilding() { return this.#building; }
  getRoomNumber() { return this.#roomNumber; }
  getHazardLevel() { return this.#hazardLevel; }
  getEquipmentAffected() { return this.#equipmentAffected; }

  validate() {
    super.validate();
    if (!this.#building || !String(this.#building).trim()) {
      throw new Error('Building is required for a maintenance request.');
    }
    if (!this.#roomNumber || !String(this.#roomNumber).trim()) {
      throw new Error('Room number is required for a maintenance request.');
    }
    if (!MaintenanceRequest.VALID_HAZARD_LEVELS.includes(this.#hazardLevel)) {
      throw new Error(
        `Unsupported hazard level: "${this.#hazardLevel}". ` +
        `Must be one of: ${MaintenanceRequest.VALID_HAZARD_LEVELS.join(', ')}.`
      );
    }
    if (!this.#equipmentAffected || !String(this.#equipmentAffected).trim()) {
      throw new Error('Equipment affected is required for a maintenance request.');
    }
    return true;
  }

  // ---------- Overridden (polymorphic) behaviour ----------

  getRequestSummary() {
    return (
      `${super.getRequestSummary()} | Building: ${this.#building}, Room: ${this.#roomNumber} ` +
      `- Hazard: ${this.#hazardLevel} - Equipment: ${this.#equipmentAffected}`
    );
  }

  calculatePriorityScore() {
    const priorityScores = { Low: 1, Normal: 2, High: 3, Urgent: 4 };
    const hazardScores = { Low: 0, Medium: 1, High: 3 };
    return priorityScores[this.getPriority()] + hazardScores[this.#hazardLevel];
  }

  getTargetResolutionHours() {
    if (this.#hazardLevel === 'High') return 8;
    const byPriority = { Urgent: 8, High: 24, Normal: 72, Low: 120 };
    return byPriority[this.getPriority()];
  }
}

module.exports = MaintenanceRequest;
