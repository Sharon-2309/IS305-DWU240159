'use strict';

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');

const StudentRequester = require('../src/StudentRequester');
const ServiceOfficer = require('../src/ServiceOfficer');
const Technician = require('../src/Technician');
const ICTSupportRequest = require('../src/ICTSupportRequest');
const MaintenanceRequest = require('../src/MaintenanceRequest');
const ServiceRequestManager = require('../src/ServiceRequestManager');
const UserFileRepository = require('../src/repositories/UserFileRepository');
const ServiceRequestFileRepository = require('../src/repositories/ServiceRequestFileRepository');
const RequestHistoryFileRepository = require('../src/repositories/RequestHistoryFileRepository');
const AuditFileRepository = require('../src/repositories/AuditFileRepository');

let manager, scratchDir;
let student, officer, tech;

before(async () => {
  scratchDir = await fs.mkdtemp(path.join(os.tmpdir(), 'at3-reports-test-'));
  manager = new ServiceRequestManager({
    userRepo: new UserFileRepository(scratchDir),
    requestRepo: new ServiceRequestFileRepository(scratchDir),
    historyRepo: new RequestHistoryFileRepository(scratchDir),
    auditRepo: new AuditFileRepository(scratchDir),
  });

  student = new StudentRequester('DWU2026001', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'BIS', 3);
  officer = new ServiceOfficer('DWU2026002', 'Mary', 'Tau', 'mary@dwu.ac.pg', 'ICT Services');
  tech = new Technician('DWU2026003', 'Peter', 'Kaupa', 'peter@dwu.ac.pg', 'Networking');
  await manager.registerUser(student);
  await manager.registerUser(officer);
  await manager.registerUser(tech);

  const urgent = new ICTSupportRequest(
    manager.generateRequestId(), student, 'Server down', 'Critical outage.', 'Server Room', 'Urgent',
    { deviceType: 'Server', systemName: 'Core switch', faultType: 'Hardware failure', networkImpact: 'Full Outage' }
  );
  await manager.submitRequest(urgent);

  const normal = new MaintenanceRequest(
    manager.generateRequestId(), student, 'Broken chair', 'Minor damage.', 'Library', 'Normal',
    { building: 'Library', roomNumber: '2', hazardLevel: 'Low', equipmentAffected: 'Chair' }
  );
  await manager.submitRequest(normal);

  await manager.reviewRequest(normal.getRequestId(), officer.getUserId());
  await manager.assignTechnician(normal.getRequestId(), officer.getUserId(), tech.getUserId());
  await manager.beginWork(normal.getRequestId(), tech.getUserId());
  await manager.resolveRequest(normal.getRequestId(), tech.getUserId());
  await manager.verifyAndClose(normal.getRequestId(), officer.getUserId());
});

describe('ServiceRequestManager — management report calculations', () => {
  test('getRequestsGroupedByCategory() correctly buckets each category', () => {
    const grouped = manager.getRequestsGroupedByCategory();
    assert.equal(grouped['ICT Support'].length, 1);
    assert.equal(grouped['Facilities Maintenance'].length, 1);
  });

  test('getUrgentRequests() returns only Urgent-priority requests', () => {
    const urgent = manager.getUrgentRequests();
    assert.equal(urgent.length, 1);
    assert.equal(urgent[0].getPriority(), 'Urgent');
  });

  test('getRequestSummaryByStatus() reflects the current lifecycle mix', () => {
    const summary = manager.getRequestSummaryByStatus();
    assert.equal(summary.Submitted, 1); // the urgent ICT one, never progressed
    assert.equal(summary.Closed, 1); // the maintenance one, closed above
  });

  test('getAverageResolutionTimeHours() returns a sane non-negative number for completed requests', () => {
    const avg = manager.getAverageResolutionTimeHours();
    assert.equal(typeof avg, 'number');
    assert.ok(avg >= 0);
  });

  test('getCompletedRequestsByTechnician() only counts Resolved/Closed work assigned to that technician', () => {
    const completed = manager.getCompletedRequestsByTechnician(tech.getUserId());
    assert.equal(completed.length, 1);
    assert.equal(completed[0].getStatus(), 'Closed');
  });
});
