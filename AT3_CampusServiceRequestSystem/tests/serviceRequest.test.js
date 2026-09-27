'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const StudentRequester = require('../src/StudentRequester');
const ServiceRequest = require('../src/ServiceRequest');
const ICTSupportRequest = require('../src/ICTSupportRequest');
const MaintenanceRequest = require('../src/MaintenanceRequest');
const CleaningRequest = require('../src/CleaningRequest');
const GeneralServiceRequest = require('../src/GeneralServiceRequest');

const student = new StudentRequester('DWU2026001', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'BIS', 3);

describe('ServiceRequest — abstract-style base class', () => {
  test('base ServiceRequest.getRequestSummary() throws (must be overridden)', () => {
    const bare = Object.create(ServiceRequest.prototype);
    assert.throws(() => bare.getRequestSummary(), /must override/);
  });

  test('base ServiceRequest.calculatePriorityScore() throws (must be overridden)', () => {
    const bare = Object.create(ServiceRequest.prototype);
    assert.throws(() => bare.calculatePriorityScore(), /must override/);
  });
});

describe('Specialised ServiceRequest subclasses — valid construction', () => {
  test('ICTSupportRequest constructs with a fixed category via super()', () => {
    const req = new ICTSupportRequest(
      'TREQ001', student, 'Wi-Fi down', 'No connectivity.', 'Library', 'High',
      { deviceType: 'Laptop', systemName: 'Wi-Fi', faultType: 'No connectivity', networkImpact: 'Partial' }
    );
    assert.equal(req.getCategory(), 'ICT Support');
    assert.equal(req.getStatus(), 'Submitted');
  });
});

describe('Specialised ServiceRequest subclasses — invalid constructor values', () => {
  test('ICTSupportRequest rejects an unsupported network impact (specialised field validated)', () => {
    assert.throws(
      () => new ICTSupportRequest(
        'TREQ002', student, 'Test', 'Test description', 'Somewhere', 'Low',
        { deviceType: 'PC', systemName: 'Email', faultType: 'Login', networkImpact: 'Catastrophic' }
      ),
      /Unsupported network impact/
    );
  });

  test('MaintenanceRequest rejects a missing room number (specialised field validated)', () => {
    assert.throws(
      () => new MaintenanceRequest(
        'TREQ003', student, 'Test', 'Test description', 'Somewhere', 'Low',
        { building: 'A', roomNumber: '', hazardLevel: 'Low', equipmentAffected: 'Desk' }
      ),
      /Room number is required/
    );
  });

  test('CleaningRequest still enforces inherited ServiceRequest validation (unsupported priority)', () => {
    assert.throws(
      () => new CleaningRequest(
        'TREQ004', student, 'Test', 'Test description', 'Somewhere', 'Catastrophic',
        { cleaningArea: 'Foyer', hygieneRisk: 'Low', serviceType: 'Sweep', preferredServiceTime: 'Morning' }
      ),
      /Unsupported priority/
    );
  });
});

describe('Polymorphism — same method calls, type-specific behaviour', () => {
  const ict = new ICTSupportRequest(
    'TREQ010', student, 'Wi-Fi down', 'No connectivity.', 'Library', 'High',
    { deviceType: 'Laptop', systemName: 'Wi-Fi', faultType: 'No connectivity', networkImpact: 'Full Outage' }
  );
  const maint = new MaintenanceRequest(
    'TREQ011', student, 'Broken light', 'Unsafe.', 'Block C', 'Normal',
    { building: 'Block C', roomNumber: '4', hazardLevel: 'High', equipmentAffected: 'Light' }
  );
  const clean = new CleaningRequest(
    'TREQ012', student, 'Spill', 'Liquid spill.', 'Cafeteria', 'Urgent',
    { cleaningArea: 'Cafeteria', hygieneRisk: 'High', serviceType: 'Spill cleanup', preferredServiceTime: 'Now' }
  );
  const general = new GeneralServiceRequest(
    'TREQ013', student, 'Lost ID', 'Need help.', 'Admin', 'Low',
    { contactPreference: 'Email', urgencyReason: 'Access', estimatedDurationMinutes: 15 }
  );

  test("getRequestSummary() reflects each type's own specialised fields", () => {
    assert.match(ict.getRequestSummary(), /Device:/);
    assert.match(maint.getRequestSummary(), /Building:/);
    assert.match(clean.getRequestSummary(), /Hygiene risk:/);
    assert.match(general.getRequestSummary(), /Contact:/);
  });

  test('calculatePriorityScore() and getTargetResolutionHours() are called polymorphically over one mixed collection', () => {
    const requests = [ict, maint, clean, general];
    for (const request of requests) {
      const score = request.calculatePriorityScore();
      const hours = request.getTargetResolutionHours();
      assert.equal(typeof score, 'number');
      assert.equal(typeof hours, 'number');
      assert.ok(hours > 0);
    }
    // A Full Outage ICT request should have a tighter target than a Low-priority general request.
    assert.ok(ict.getTargetResolutionHours() < general.getTargetResolutionHours());
  });
});
