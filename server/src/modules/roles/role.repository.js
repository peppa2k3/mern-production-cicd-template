const BaseRepository = require('../../common/utils/BaseRepository');
const Role = require('./role.model');

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  findAllSimple() {
    return this.model.find().sort({ createdAt: 1 });
  }
}

module.exports = new RoleRepository();
