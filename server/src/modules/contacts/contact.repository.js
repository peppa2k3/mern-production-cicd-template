const BaseRepository = require('../../common/utils/BaseRepository');
const Contact = require('./contact.model');

class ContactRepository extends BaseRepository {
  constructor() {
    super(Contact);
  }

  paginateAdmin(filter, query) {
    return this.paginate(filter, query, ['assignee']);
  }
}

module.exports = new ContactRepository();
