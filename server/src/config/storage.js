const { Client } = require('minio');
const env = require('./env');

const storageClient = env.upload.storage === 'minio' ? new Client({
  endPoint: env.minio.endPoint,
  port: env.minio.port,
  useSSL: env.minio.useSSL,
  accessKey: env.minio.accessKey,
  secretKey: env.minio.secretKey,
}) : null;

async function initializeStorage() {
  if (storageClient && !(await storageClient.bucketExists(env.minio.bucket))) {
    // Create only this application's bucket; leave shared service configuration alone.
    await storageClient.makeBucket(env.minio.bucket);
  }
}

module.exports = { storageClient, initializeStorage };
