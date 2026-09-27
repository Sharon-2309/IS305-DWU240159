'use strict';

const ICTSupportRequest = require('./ICTSupportRequest');
const MaintenanceRequest = require('./MaintenanceRequest');
const CleaningRequest = require('./CleaningRequest');
const GeneralServiceRequest = require('./GeneralServiceRequest');

/**
 * Recreates the correct specialised ServiceRequest object from plain data
 * loaded out of a JSON file. JSON has no concept of classes — everything
 * that comes back from fs/promises is a plain object — so this factory is
 * what restores real, behaviour-bearing objects (with working
 * getRequestSummary(), calculatePriorityScore(), etc.) after a restart.
 */
class ServiceRequestFactory {
  /**
   * @param {object} savedData - a plain object as stored in serviceRequests.json
   * @param {User} requester - the already-restored User object for this request
   * @returns {ServiceRequest} the correct subclass instance
   */
  static createFromData(savedData, requester) {
    if (!savedData || typeof savedData !== 'object') {
      throw new Error('ServiceRequestFactory.createFromData() requires a saved data object.');
    }
    if (!requester) {
      throw new Error(
        `ServiceRequestFactory.createFromData(): no requester supplied for request ` +
        `"${savedData.requestId}". The requester must be restored first.`
      );
    }

    const {
      requestId, requestType, title, description, location, priority,
      specialisedFields = {},
    } = savedData;

    let request;
    switch (requestType) {
      case 'ICTSupportRequest':
        request = new ICTSupportRequest(
          requestId, requester, title, description, location, priority, specialisedFields
        );
        break;
      case 'MaintenanceRequest':
        request = new MaintenanceRequest(
          requestId, requester, title, description, location, priority, specialisedFields
        );
        break;
      case 'CleaningRequest':
        request = new CleaningRequest(
          requestId, requester, title, description, location, priority, specialisedFields
        );
        break;
      case 'GeneralServiceRequest':
        request = new GeneralServiceRequest(
          requestId, requester, title, description, location, priority, specialisedFields
        );
        break;
      default:
        throw new Error(`ServiceRequestFactory: unknown requestType "${requestType}".`);
    }

    // The constructor above sets status to "Submitted" and starts a fresh
    // history — restore the actual saved status/history/assignment/dates
    // now that the object exists, via the restore-only internal setter.
    request._restoreState({
      status: savedData.status,
      assignedTechnicianId: savedData.assignedTechnicianId ?? null,
      dateSubmitted: savedData.dateSubmitted,
      dateUpdated: savedData.dateUpdated,
      history: savedData.history || [],
    });

    return request;
  }
}

module.exports = ServiceRequestFactory;
