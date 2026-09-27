'use strict';

const path = require('node:path');
const FileRepository = require('./FileRepository');

const DEFAULT_DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * Stores a flattened view of every request's history entries in a single
 * file, as required by the brief's data folder (users.json,
 * serviceRequests.json, requestHistory.json, auditLog.json). Each
 * ServiceRequest keeps its own history array internally for its own
 * business logic — this repository is a separate, queryable export of
 * that same data, tagged with requestId and a synthetic historyEntryId.
 */
class RequestHistoryFileRepository extends FileRepository {
  constructor(dataDir = DEFAULT_DATA_DIR) {
    super(path.join(dataDir, 'requestHistory.json'), 'historyEntryId');
  }

  async findByRequest(requestId) {
    const records = await this.loadAll();
    return records.filter((r) => r.requestId === requestId);
  }
}

module.exports = RequestHistoryFileRepository;
