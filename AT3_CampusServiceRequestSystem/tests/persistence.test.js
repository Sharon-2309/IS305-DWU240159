'use strict';

const { test, describe, beforeEach, afterEach } = require('node:test');
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
const FileRepository = require('../src/repositories/FileRepository');

let scratchDir;

beforeEach(async () => {
  scratchDir = await fs.mkdtemp(path.join(os.tmpdir(), 'at3-persistence-test-'));
});

afterEach(async () => {
  await fs.rm(scratchDir, { recursive: true, force: true });
});

function makeManager(dir) {
  return new ServiceRequestManager({
    userRepo: new UserFileRepository(dir),
    requestRepo: new ServiceRequestFileRepository(dir),
    historyRepo: new RequestHistoryFileRepository(dir),
    auditRepo: new AuditFileRepository(dir),
  });
}

describe('File repositories — missing or empty data files', () => {
  test('loadAll() returns an empty array when the file does not exist yet', async () => {
    const repo = new UserFileRepository(scratchDir);
    const result = await repo.loadAll();
    assert.deepEqual(result, []);
  });

  test('loadAll() returns an empty array for an empty (zero-byte) file', async () => {
    const repo = new UserFileRepository(scratchDir);
    await fs.mkdir(scratchDir, { recursive: true });
    await fs.writeFile(path.join(scratchDir, 'users.json'), '', 'utf8');
    const result = await repo.loadAll();
    assert.deepEqual(result, []);
  });
});

describe('File repositories — file-writing errors', () => {
  test('saveAll() throws a clear error when the target path is unwritable', async () => {
    // Point the repository at a path where a *file* exists in place of the
    // directory it needs to create — forces a real filesystem error.
    const blockingFile = path.join(scratchDir, 'not-a-directory');
    await fs.writeFile(blockingFile, 'block', 'utf8');
    const repo = new FileRepository(path.join(blockingFile, 'users.json'), 'userId');
    await assert.rejects(() => repo.saveAll([{ userId: 'X' }]), /Failed to write/);
  });
});

describe('ServiceRequestManager — saving and loading JSON data', () => {
  test('saving a user actually writes users.json to disk', async () => {
    const manager = makeManager(scratchDir);
    const student = new StudentRequester('DWU2026001', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'BIS', 3);
    await manager.registerUser(student);
    const raw = await fs.readFile(path.join(scratchDir, 'users.json'), 'utf8');
    const saved = JSON.parse(raw);
    assert.equal(saved.length, 1);
    assert.equal(saved[0].userId, 'DWU2026001');
  });

  test('a new manager instance restores a full working system from disk', async () => {
    const manager = makeManager(scratchDir);
    const student = new StudentRequester('DWU2026001', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'BIS', 3);
    const officer = new ServiceOfficer('DWU2026002', 'Mary', 'Tau', 'mary@dwu.ac.pg', 'ICT Services');
    const tech = new Technician('DWU2026003', 'Peter', 'Kaupa', 'peter@dwu.ac.pg', 'Networking');
    await manager.registerUser(student);
    await manager.registerUser(officer);
    await manager.registerUser(tech);

    const request = new ICTSupportRequest(
      manager.generateRequestId(), student, 'Wi-Fi down', 'No connectivity.', 'Library', 'High',
      { deviceType: 'Laptop', systemName: 'Wi-Fi', faultType: 'No connectivity', networkImpact: 'Partial' }
    );
    await manager.submitRequest(request);
    await manager.reviewRequest(request.getRequestId(), officer.getUserId());
    await manager.assignTechnician(request.getRequestId(), officer.getUserId(), tech.getUserId());

    // Simulate a restart: brand-new manager, same data directory.
    const reloaded = makeManager(scratchDir);
    const counts = await reloaded.loadAll();
    assert.equal(counts.usersLoaded, 3);
    assert.equal(counts.requestsLoaded, 1);

    const restoredRequest = reloaded.findRequestById(request.getRequestId());
    assert.equal(restoredRequest.constructor.name, 'ICTSupportRequest');
    assert.equal(restoredRequest.getStatus(), 'Assigned');
    assert.equal(restoredRequest.getDeviceType(), 'Laptop');
    assert.equal(restoredRequest.getRequester().constructor.name, 'StudentRequester');
    assert.ok(restoredRequest.getHistory().length >= 3);
  });

  test('a restored request can continue its workflow correctly', async () => {
    const manager = makeManager(scratchDir);
    const student = new StudentRequester('DWU2026001', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'BIS', 3);
    const officer = new ServiceOfficer('DWU2026002', 'Mary', 'Tau', 'mary@dwu.ac.pg', 'ICT Services');
    const tech = new Technician('DWU2026003', 'Peter', 'Kaupa', 'peter@dwu.ac.pg', 'Networking');
    await manager.registerUser(student);
    await manager.registerUser(officer);
    await manager.registerUser(tech);

    const request = new ICTSupportRequest(
      manager.generateRequestId(), student, 'Wi-Fi down', 'No connectivity.', 'Library', 'High',
      { deviceType: 'Laptop', systemName: 'Wi-Fi', faultType: 'No connectivity', networkImpact: 'Partial' }
    );
    await manager.submitRequest(request);
    await manager.reviewRequest(request.getRequestId(), officer.getUserId());
    await manager.assignTechnician(request.getRequestId(), officer.getUserId(), tech.getUserId());
    await manager.beginWork(request.getRequestId(), tech.getUserId());

    const reloaded = makeManager(scratchDir);
    await reloaded.loadAll();
    await reloaded.resolveRequest(request.getRequestId(), tech.getUserId());
    await reloaded.verifyAndClose(request.getRequestId(), officer.getUserId());

    assert.equal(reloaded.findRequestById(request.getRequestId()).getStatus(), 'Closed');
  });
});
