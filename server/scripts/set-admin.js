// Operator CLI only. Public registration never grants administrative privileges.
const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/modules/users/user.model');
const Role = require('../src/modules/roles/role.model');
const ActivityLog = require('../src/modules/activity-logs/activityLog.model');
const { ROLES, DEFAULT_ROLE_PERMISSIONS } = require('../src/common/constants/roles');

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const roleName = process.argv[3] || ROLES.ADMIN;
  if (!email || ![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(roleName)) {
    throw new Error('Usage: npm run set-admin -- <existing-email> [admin|super_admin]');
  }
  await mongoose.connect(env.mongoUri);
  const user = await User.findOne({ email });
  if (!user) throw new Error('Account not found; register first');
  const role = await Role.findOneAndUpdate({ name: roleName }, { $setOnInsert: {
    name: roleName, displayName: roleName, permissions: DEFAULT_ROLE_PERMISSIONS[roleName], isSystem: true,
  } }, { upsert: true, new: true });
  user.role = role._id;
  user.isActive = true;
  user.refreshTokens = [];
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();
  await ActivityLog.create({
    user: user._id, resource: 'User', resourceId: user._id,
    action: 'bootstrap-admin', metadata: { source: 'operator-cli', role: roleName },
  });
  console.log(`Assigned ${roleName} to existing account; old refresh sessions revoked.`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
