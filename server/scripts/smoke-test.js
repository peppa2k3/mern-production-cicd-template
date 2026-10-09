// Runs only against an isolated local/CI database. Exercises real Nginx/Mongo/MinIO.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/modules/users/user.model');
const ActivityLog = require('../src/modules/activity-logs/activityLog.model');
const File = require('../src/modules/files/file.model');
const { storageClient } = require('../src/config/storage');

async function main() {
  if (env.nodeEnv === 'production') throw new Error('Smoke test is disabled in production');
  const base = process.env.SMOKE_BASE_URL || 'http://localhost:8080';
  const email = `smoke-${crypto.randomUUID()}@example.com`;
  const password = crypto.randomBytes(20).toString('hex');
  const request = (url, options = {}) => fetch(`${base}${url}`, options);
  const post = (data, token) => ({ method: 'POST', headers: {
    'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }, body: JSON.stringify(data) });
  await mongoose.connect(env.mongoUri);
  let user;
  try {
    assert.equal((await request('/')).status, 200);
    for (const path of ['/api/health', '/api/v1/health']) {
      const response = await request(path);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).success, true);
    }
    const registered = await request('/api/v1/auth/register', post({ name: 'Smoke Test', email, password }));
    assert.equal(registered.status, 201);
    user = await User.findOne({ email });
    assert.equal(user.isActive, false);
    assert.equal((await request('/api/v1/auth/login', post({ email, password }))).status, 403);
    execFileSync(process.execPath, ['scripts/set-admin.js', email], { stdio: 'pipe' });
    const login = await request('/api/v1/auth/login', post({ email, password }));
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const session = (await login.json()).data;
    assert.equal(session.user.role.name, 'admin');
    assert.equal(session.user.passwordHash, undefined);
    assert.ok(await ActivityLog.exists({ resourceId: user._id, action: 'bootstrap-admin' }));
    const profile = await request('/api/v1/auth/me', { headers: { Authorization: `Bearer ${session.accessToken}` } });
    assert.equal(profile.status, 200);
    const refreshed = await request('/api/v1/auth/refresh', { ...post({}), headers: { 'Content-Type': 'application/json', Cookie: cookie } });
    assert.equal(refreshed.status, 200);
    const refreshedSession = (await refreshed.json()).data;
    assert.equal((await request('/api/v1/auth/refresh', { ...post({}), headers: { 'Content-Type': 'application/json', Cookie: cookie } })).status, 401);
    const media = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jp1sAAAAASUVORK5CYII=', 'base64');
    const form = new FormData();
    form.append('file', new Blob([media], { type: 'image/png' }), 'smoke.png');
    const uploaded = await request('/api/v1/files/single', { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}` }, body: form });
    assert.equal(uploaded.status, 201);
    const file = (await uploaded.json()).data;
    assert.equal(file.storage, 'minio');
    const downloaded = await request(file.url);
    assert.equal(downloaded.status, 200);
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), media);
    const partial = await request(file.url, { headers: { Range: 'bytes=0-7' } });
    assert.equal(partial.status, 206);
    assert.equal(partial.headers.get('content-range'), `bytes 0-7/${media.length}`);
    assert.deepEqual(Buffer.from(await partial.arrayBuffer()), media.subarray(0, 8));
    assert.equal((await request(file.url, { headers: { Range: 'bytes=999999-' } })).status, 416);
    assert.equal((await request('/api/v1/files/single', { method: 'POST' })).status, 401);
    assert.equal((await request('/api/v1/products/public')).status, 200);
    assert.equal((await request('/api/v1/categories/public')).status, 200);
    const changed = await request('/api/v1/auth/change-password', post({ currentPassword: password, newPassword: crypto.randomBytes(20).toString('hex') }, refreshedSession.accessToken));
    assert.equal(changed.status, 200);
    assert.equal((await request('/api/v1/auth/me', { headers: { Authorization: `Bearer ${session.accessToken}` } })).status, 401);
    console.log('Smoke passed: readiness, pending registration, admin CLI/audit, auth/refresh, MinIO upload/download, public APIs.');
  } finally {
    if (user) {
      for (const file of await File.find({ uploadedBy: user._id })) {
        if (file.objectKey) await storageClient.removeObject(env.minio.bucket, file.objectKey);
      }
      await File.deleteMany({ uploadedBy: user._id });
      await ActivityLog.deleteMany({ user: user._id });
      await User.deleteOne({ _id: user._id });
    }
    await mongoose.disconnect();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
