// Exercise failure paths in a separate test process without stopping storage.
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const { storageClient } = require('../src/config/storage');
const app = require('../src/app');

async function main() {
  if (env.nodeEnv === 'production' || !storageClient) throw new Error('Use isolated local/CI with MinIO');
  await mongoose.connect(env.mongoUri);
  const original = storageClient.bucketExists.bind(storageClient);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    storageClient.bucketExists = async () => false;
    assert.equal((await fetch(`${base}/health`)).status, 200);
    assert.equal((await fetch(`${base}/api/health`)).status, 503);
    storageClient.bucketExists = () => new Promise(() => {});
    const started = Date.now();
    assert.equal((await fetch(`${base}/api/health`)).status, 503);
    assert.ok(Date.now() - started < 5000);
    storageClient.bucketExists = original;
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    console.log('Readiness passed: mocked missing/stalled bucket returns 503, liveness stays 200, real storage returns 200.');
  } finally {
    storageClient.bucketExists = original;
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
