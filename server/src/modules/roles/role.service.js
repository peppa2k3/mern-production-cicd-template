const roleRepository = require('./role.repository');
const AppError = require('../../common/errors/AppError');
const { PERMISSIONS } = require('../../common/constants/roles');

class RoleService {
  list() {
    return roleRepository.findAllSimple();
  }

  listPermissions() {
    return Object.values(PERMISSIONS);
  }

  async create(data) {
    const existing = await roleRepository.findOne({ name: data.name.toLowerCase() });
    if (existing) throw AppError.conflict('Role name already exists');
    return roleRepository.create({ ...data, name: data.name.toLowerCase() });
  }

  async update(id, data) {
    const role = await roleRepository.findById(id);
    if (!role) throw AppError.notFound('Role not found');
    if (role.isSystem && data.permissions) {
      // system roles can still have permissions tuned, but not renamed/deleted
    }
    return roleRepository.updateById(id, data);
  }

  async remove(id) {
    const role = await roleRepository.findById(id);
    if (!role) throw AppError.notFound('Role not found');
    if (role.isSystem) throw AppError.forbidden('Cannot delete a system role');
    await roleRepository.deleteById(id);
  }
}

module.exports = new RoleService();
