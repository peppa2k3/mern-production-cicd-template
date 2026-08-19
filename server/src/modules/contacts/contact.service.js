const contactRepository = require('./contact.repository');
const AppError = require('../../common/errors/AppError');
const activityLogService = require('../activity-logs/activityLog.service');

class ContactService {
  submit(data) {
    return contactRepository.create(data);
  }

  list(query) {
    const filter = {};
    if (query.status) filter.status = query.status;
    return contactRepository.paginateAdmin(filter, query);
  }

  async update(id, data, actor) {
    const contact = await contactRepository.updateById(id, data);
    if (!contact) throw AppError.notFound('Contact not found');

    await activityLogService.log({
      user: actor._id,
      action: 'contact.update',
      resource: 'Contact',
      resourceId: id,
      metadata: data,
    });

    return contact;
  }

  async remove(id, actor) {
    const contact = await contactRepository.deleteById(id);
    if (!contact) throw AppError.notFound('Contact not found');
    await activityLogService.log({
      user: actor._id,
      action: 'contact.delete',
      resource: 'Contact',
      resourceId: id,
    });
  }
}

module.exports = new ContactService();
