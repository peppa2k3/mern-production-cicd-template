const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mern-config-'));
const valid = {
  NODE_ENV: 'production', CLIENT_URL: 'https://affiliate.example.com', TRUST_PROXY_HOPS: '1',
  MONGO_URI: 'mongodb://test-db:27017/test',
  JWT_ACCESS_SECRET: 'a'.repeat(64), JWT_REFRESH_SECRET: 'b'.repeat(64), COOKIE_SECRET: 'c'.repeat(64),
  UPLOAD_STORAGE: 'minio', MINIO_ACCESS_KEY: 'test-only', MINIO_SECRET_KEY: 'd'.repeat(64),
};
function check(overrides, expectedError) {
  const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(path.resolve(__dirname, '../src/config/env.js'))})`], {
    cwd: directory,
    env: { ...process.env, ...valid, ...overrides },
    encoding: 'utf8',
  });
  if (expectedError) {
    assert.notEqual(result.status, 0);
    assert.ok(result.stderr.includes(expectedError));
  } else assert.equal(result.status, 0, result.stderr);
}
try {
  check({});
  check({ MONGO_URI: '' }, 'explicit MONGO_URI');
  check({ JWT_ACCESS_SECRET: '' }, 'distinct JWT');
  check({ JWT_ACCESS_SECRET: valid.JWT_REFRESH_SECRET }, 'distinct JWT');
  check({ CLIENT_URL: 'http://affiliate.example.com' }, 'HTTPS origin');
  check({ CLIENT_URL: 'https://affiliate.example.com/path' }, 'HTTPS origin');
  check({ MINIO_SECRET_KEY: '' }, 'MINIO_ACCESS_KEY');
  check({ TRUST_PROXY_HOPS: '-1' }, 'non-negative integer');
  check({ MINIO_PORT: '99999' }, 'MINIO_PORT');
  console.log('Production config guards passed: valid config, weak/equal secrets, origin, storage, proxy and port.');
} finally {
  // This temporary directory contains no files or data.
  fs.rmdirSync(directory);
}
