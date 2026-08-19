const BaseRepository = require('../../common/utils/BaseRepository');
const User = require('./user.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email) {
    return this.model.findOne({ email });
  }

  paginateUsers(filter, query) {
    return this.paginate(filter, query, ['role']);
  }
}

module.exports = new UserRepository();
