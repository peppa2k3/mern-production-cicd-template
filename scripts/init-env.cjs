const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

for (const directory of ['server', 'client']) {
  const target = path.resolve(__dirname, '..', directory, '.env');
  if (fs.existsSync(target)) {
    console.log(`Keeping existing ${directory}/.env`);
    continue;
  }
  let content = fs.readFileSync(`${target}.example`, 'utf8');
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET', 'MINIO_SECRET_KEY', 'SUPER_ADMIN_PASSWORD']) {
    content = content.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${crypto.randomBytes(32).toString('hex')}`);
  }
  fs.writeFileSync(target, content, { flag: 'wx', mode: 0o600 });
  console.log(`Created ${directory}/.env; generated secrets are not printed`);
}
