'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const User = require('../src/User');
const StudentRequester = require('../src/StudentRequester');
const StaffRequester = require('../src/StaffRequester');

describe('User — valid construction', () => {
  test('constructs successfully with valid data', () => {
    const user = new User('DWU2026001', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'Student');
    assert.equal(user.getUserId(), 'DWU2026001');
    assert.equal(user.getFullName(), 'Sharon Kaupa');
  });
});

describe('User — invalid constructor values', () => {
  test('rejects a missing user ID', () => {
    assert.throws(
      () => new User('', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'Student'),
      /User ID is required/
    );
  });

  test('rejects an invalid email address', () => {
    assert.throws(
      () => new User('DWU2026002', 'Sharon', 'Kaupa', 'not-an-email', 'Student'),
      /Invalid email address/
    );
  });

  test('rejects an unsupported user type', () => {
    assert.throws(
      () => new User('DWU2026003', 'Sharon', 'Kaupa', 'sharon@dwu.ac.pg', 'Alien'),
      /Unsupported user type/
    );
  });
});

describe('User subclasses — inheritance and constructor chaining', () => {
  test('StudentRequester chains to User via super() and sets userType automatically', () => {
    const student = new StudentRequester('DWU2026004', 'John', 'Waim', 'john@dwu.ac.pg', 'BIS', 2);
    assert.equal(student.getUserType(), 'Student');
    assert.ok(student instanceof User);
    assert.equal(student.getProgramme(), 'BIS');
  });

  test('StudentRequester rejects an invalid specialised field (year level)', () => {
    assert.throws(
      () => new StudentRequester('DWU2026005', 'Test', 'User', 'test@dwu.ac.pg', 'BIS', 9),
      /Year level/
    );
  });

  test('StudentRequester still enforces inherited User validation (email)', () => {
    assert.throws(
      () => new StudentRequester('DWU2026006', 'Test', 'User', 'bad-email', 'BIS', 2),
      /Invalid email address/
    );
  });

  test('StaffRequester chains to User via super() with a fixed userType', () => {
    const staff = new StaffRequester('DWU2026007', 'Mary', 'Tau', 'mary@dwu.ac.pg', 'Facilities');
    assert.equal(staff.getUserType(), 'Staff');
    assert.equal(staff.getDepartment(), 'Facilities');
  });
});
