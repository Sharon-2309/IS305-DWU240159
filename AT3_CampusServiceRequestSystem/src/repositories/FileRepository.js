'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

/**
 * Shared, generic JSON file storage used by UserFileRepository,
 * ServiceRequestFileRepository, RequestHistoryFileRepository and
 * AuditFileRepository. Not one of the three repository classes named in
 * the brief itself, but factoring out the common load/save/create/find/
 * update logic keeps each of those four small and focused, and is itself
 * an example of separating file I/O from the domain and console layers.
 *
 * Every method here deals only in plain JSON-safe objects — it never
 * touches a User or ServiceRequest instance directly.
 */
class FileRepository {
  #filePath;
  #idField;

  constructor(filePath, idField) {
    this.#filePath = filePath;
    this.#idField = idField;
  }

  /** Loads every record. Returns [] if the file doesn't exist yet. */
  async loadAll() {
    try {
      const raw = await fs.readFile(this.#filePath, 'utf8');
      if (!raw.trim()) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      if (err.code === 'ENOENT') {
        // No file yet (first run) — an empty array is the correct state,
        // not an error.
        return [];
      }
      throw new Error(`Failed to read ${this.#filePath}: ${err.message}`);
    }
  }

  /** Overwrites the file with exactly this array of records. */
  async saveAll(records) {
    try {
      await fs.mkdir(path.dirname(this.#filePath), { recursive: true });
      await fs.writeFile(this.#filePath, JSON.stringify(records, null, 2), 'utf8');
    } catch (err) {
      throw new Error(`Failed to write ${this.#filePath}: ${err.message}`);
    }
    return records;
  }

  /** Appends one new record and persists it. */
  async create(record) {
    const records = await this.loadAll();
    records.push(record);
    await this.saveAll(records);
    return record;
  }

  async findById(id) {
    const records = await this.loadAll();
    return records.find((r) => r[this.#idField] === id) || null;
  }

  /** Merges `changes` into the existing record with this ID and persists it. */
  async update(id, changes) {
    const records = await this.loadAll();
    const index = records.findIndex((r) => r[this.#idField] === id);
    if (index === -1) {
      throw new Error(`No record found with ${this.#idField} "${id}" in ${this.#filePath}.`);
    }
    records[index] = { ...records[index], ...changes };
    await this.saveAll(records);
    return records[index];
  }
}

module.exports = FileRepository;
