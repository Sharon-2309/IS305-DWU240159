'use strict';

const path = require('node:path');
const FileRepository = require('./FileRepository');

const DEFAULT_DATA_DIR = path.join(__dirname, '..', '..', 'data');

class UserFileRepository extends FileRepository {
  constructor(dataDir = DEFAULT_DATA_DIR) {
    super(path.join(dataDir, 'users.json'), 'userId');
  }
}

module.exports = UserFileRepository;
