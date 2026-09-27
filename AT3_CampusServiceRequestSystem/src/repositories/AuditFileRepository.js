'use strict';

const path = require('node:path');
const FileRepository = require('./FileRepository');

const DEFAULT_DATA_DIR = path.join(__dirname, '..', '..', 'data');

class AuditFileRepository extends FileRepository {
  constructor(dataDir = DEFAULT_DATA_DIR) {
    super(path.join(dataDir, 'auditLog.json'), 'auditId');
  }

  async findByRequest(requestId) {
    const records = await this.loadAll();
    return records.filter((r) => r.affectedRequestId === requestId);
  }
}

module.exports = AuditFileRepository;
