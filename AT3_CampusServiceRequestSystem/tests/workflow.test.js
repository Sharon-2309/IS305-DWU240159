'use strict';

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');

const StudentRequester = require('../src/StudentRequester');
const ServiceOfficer = require('../src/ServiceOfficer');
const Technician = require('../src/Technician');
const ICTSupportRequest = require('../src/ICTSupportRequest');
const ServiceRequestManager = require('../src/ServiceRequestManager');
const UserFileRepository = require('../src/repositories/UserFileRepository');
const ServiceRequestFileRepository = require('../src/repositories/ServiceRequestFileRepository');
const RequestHistoryFileRepository = require('../src/repositories/RequestHistoryFileRepository');
const AuditFileRepository = require('../src/repositories/AuditFileRepository');

// Every test in this file uses its own temporary directory under the OS
// temp folder — never the application's real data/ folder.
let scratchDir;
let manager;
let student, officer, tech, otherTech;

beforeEach(async () => {
  scratchDir = await fs.mkdtemp(path.join(os.tmpdir(), 'at3-workflow-test-'));
  manager = new ServiceRequestManager({
    userRepo: new UserFileRepository(scratchDir),
    requestRepo: new ServiceRequestFileRepository(scratchDir),
    historyRepo: new RequestHistoryFileRepository(scratchDir),
    auditRepo: new AuditFileRepository(scratchDir),
  });

  student = new StudentRequester('DWU2026001', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'BIS', 3);
  officer = new ServiceOfficer('DWU2026002', 'Mary', 'Tau', 'mary@dwu.ac.pg', 'ICT Services');
  tech = new Technician('DWU2026003', 'Peter', 'Kaupa', 'peter@dwu.ac.pg', 'Networking');
  otherTech = new Technician('DWU2026004', 'Grace', 'Namu', 'grace@dwu.ac.pg', 'Hardware');

  await manager.registerUser(student);
  await manager.registerUser(officer);
  await manager.registerUser(tech);
  await manager.registerUser(otherTech);
});

describe('ServiceRequestManager — duplicate identifiers', () => {
  test('rejects registering a duplicate user ID', async () => {
    const dupe = new StudentRequester('DWU2026001', 'Other', 'Person', 'other@dwu.ac.pg', 'BIS', 1);
    await assert.rejects(() => manager.registerUser(dupe), /Duplicate user ID/);
  });

  test('rejects submitting a duplicate request ID', async () => {
    const req = new ICTSupportRequest(
      'DUPREQ', student, 'Test', 'Test description', 'Somewhere', 'Low',
      { deviceType: 'PC', systemName: 'Email', faultType: 'Login', networkImpact: 'None' }
    );
    await manager.submitRequest(req);
    const dupe = new ICTSupportRequest(
      'DUPREQ', student, 'Test 2', 'Test description 2', 'Somewhere else', 'Low',
      { deviceType: 'PC', systemName: 'Email', faultType: 'Login', networkImpact: 'None' }
    );
    await assert.rejects(() => manager.submitRequest(dupe), /Duplicate request ID/);
  });
});

describe('ServiceRequestManager — role permissions', () => {
  let request;
  beforeEach(async () => {
    request = new ICTSupportRequest(
      'PREQ001', student, 'Wi-Fi down', 'No connectivity.', 'Library', 'High',
      { deviceType: 'Laptop', systemName: 'Wi-Fi', faultType: 'No connectivity', networkImpact: 'Partial' }
    );
    await manager.submitRequest(request);
  });

  test('only a Service Officer can review a request', async () => {
    await assert.rejects(
      () => manager.reviewRequest(request.getRequestId(), student.getUserId()),
      /not permitted to review requests/
    );
    await manager.reviewRequest(request.getRequestId(), officer.getUserId());
    assert.equal(request.getStatus(), 'Reviewed');
  });

  test('only the assigned Technician can begin work on a request', async () => {
    await manager.reviewRequest(request.getRequestId(), officer.getUserId());
    await manager.assignTechnician(request.getRequestId(), officer.getUserId(), tech.getUserId());
    await assert.rejects(
      () => manager.beginWork(request.getRequestId(), otherTech.getUserId()),
      /not permitted to begin work/
    );
    await manager.beginWork(request.getRequestId(), tech.getUserId());
    assert.equal(request.getStatus(), 'In Progress');
  });
});

describe('ServiceRequestManager — controlled status transitions', () => {
  let request;
  beforeEach(async () => {
    request = new ICTSupportRequest(
      'PREQ002', student, 'Wi-Fi down', 'No connectivity.', 'Library', 'High',
      { deviceType: 'Laptop', systemName: 'Wi-Fi', faultType: 'No connectivity', networkImpact: 'Partial' }
    );
    await manager.submitRequest(request);
  });

  test('rejects skipping directly from Submitted to Assigned', async () => {
    await assert.rejects(
      () => manager.assignTechnician(request.getRequestId(), officer.getUserId(), tech.getUserId()),
      /request must be Reviewed first|Invalid status transition/
    );
  });

  test('the full workflow reaches Closed through every required step', async () => {
    await manager.reviewRequest(request.getRequestId(), officer.getUserId());
    await manager.assignPriority(request.getRequestId(), officer.getUserId(), 'Urgent');
    await manager.assignTechnician(request.getRequestId(), officer.getUserId(), tech.getUserId());
    await manager.beginWork(request.getRequestId(), tech.getUserId());
    await manager.recordProgress(request.getRequestId(), tech.getUserId(), 'Working on it.');
    await manager.resolveRequest(request.getRequestId(), tech.getUserId());
    await manager.verifyAndClose(request.getRequestId(), officer.getUserId());
    assert.equal(request.getStatus(), 'Closed');
  });

  test('Closed is a final status — no further transitions allowed', async () => {
    await manager.reviewRequest(request.getRequestId(), officer.getUserId());
    await manager.assignTechnician(request.getRequestId(), officer.getUserId(), tech.getUserId());
    await manager.beginWork(request.getRequestId(), tech.getUserId());
    await manager.resolveRequest(request.getRequestId(), tech.getUserId());
    await manager.verifyAndClose(request.getRequestId(), officer.getUserId());
    await assert.rejects(
      () => manager.reviewRequest(request.getRequestId(), officer.getUserId()),
      /Invalid status transition/
    );
  });
});
