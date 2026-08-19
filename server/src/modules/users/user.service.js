const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');
const AppError = require('../../common/errors/AppError');
const activityLogService = require('../activity-logs/activityLog.service');

class UserService {
  list(query) {
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
    return userRepository.paginateUsers(filter, query);
  }

  async getById(id) {
    const user = await userRepository.findById(id, ['role']);
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async create(data, actor) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw AppError.conflict('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      isActive: data.isActive,
      passwordHash,
    });

    await activityLogService.log({
      user: actor._id,
      action: 'user.create',
      resource: 'User',
      resourceId: user._id,
    });

    return userRepository.findById(user._id, ['role']);
  }

  async update(id, data, actor) {
    const user = await userRepository.updateById(id, data);
    if (!user) throw AppError.notFound('User not found');

    await activityLogService.log({
      user: actor._id,
      action: 'user.update',
      resource: 'User',
      resourceId: id,
      metadata: data,
    });

    return userRepository.findById(id, ['role']);
  }

  async updateOwnProfile(user, data) {
    const updated = await userRepository.updateById(user._id, data);
    return updated;
  }

  async remove(id, actor) {
    const user = await userRepository.deleteById(id);
    if (!user) throw AppError.notFound('User not found');

    await activityLogService.log({
      user: actor._id,
      action: 'user.delete',
      resource: 'User',
      resourceId: id,
    });
  }

  async setActive(id, isActive, actor) {
    const user = await userRepository.updateById(id, { isActive });
    if (!user) throw AppError.notFound('User not found');

    await activityLogService.log({
      user: actor._id,
      action: isActive ? 'user.activate' : 'user.deactivate',
      resource: 'User',
      resourceId: id,
    });

    return user;
  }
}

module.exports = new UserService();
