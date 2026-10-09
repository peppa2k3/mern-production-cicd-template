const mongoose = require('mongoose');
const env = require('../src/config/env');
const Role = require('../src/modules/roles/role.model');
const { DEFAULT_ROLE_PERMISSIONS } = require('../src/common/constants/roles');

async function main() {
  await mongoose.connect(env.mongoUri);
  for (const [name, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    // Existing permission customizations are preserved.
    await Role.updateOne({ name }, { $setOnInsert: {
      name, displayName: name, permissions, isSystem: true,
    } }, { upsert: true });
  }
  console.log('Missing system roles initialized; existing roles preserved.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
