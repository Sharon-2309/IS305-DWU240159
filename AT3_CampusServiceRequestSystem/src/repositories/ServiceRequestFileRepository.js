'use strict';

const path = require('node:path');
const FileRepository = require('./FileRepository');

const DEFAULT_DATA_DIR = path.join(__dirname, '..', '..', 'data');

class ServiceRequestFileRepository extends FileRepository {
  constructor(dataDir = DEFAULT_DATA_DIR) {
    super(path.join(dataDir, 'serviceRequests.json'), 'requestId');
  }

  async findByRequester(userId) {
    const records = await this.loadAll();
    return records.filter((r) => r.requesterId === userId);
  }

  async findByTechnician(technicianId) {
    const records = await this.loadAll();
    return records.filter((r) => r.assignedTechnicianId === technicianId);
  }
}

module.exports = ServiceRequestFileRepository;
