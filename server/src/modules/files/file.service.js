const path = require('path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const { storageClient } = require('../../config/storage');
const File = require('./file.model');
const env = require('../../config/env');

class FileService {
  // Register disk uploads or transfer temporary files into the private MinIO
  // bucket. Public product URLs continue to resolve through this application.
  async registerUpload(file, uploadedBy) {
    if (storageClient) {
      const objectKey = `${crypto.randomUUID()}${path.extname(file.path).toLowerCase()}`;
      try {
        await storageClient.fPutObject(env.minio.bucket, objectKey, file.path, {
          'Content-Type': file.mimetype,
        });
        try {
          return await File.create({
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            storage: 'minio',
            objectKey,
            url: `/uploads/objects/${objectKey}`,
            uploadedBy,
          });
        } catch (error) {
          await storageClient.removeObject(env.minio.bucket, objectKey);
          throw error;
        }
      } finally {
        await fs.unlink(file.path).catch(() => {});
      }
    }
    const sub = file.mimetype.startsWith('video') ? 'videos' : 'images';
    const url = `/${env.upload.dir}/${sub}/${path.basename(file.path)}`;

    const record = await File.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storage: 'local',
      url,
      uploadedBy,
    });

    return record;
  }

  async registerMany(files, uploadedBy) {
    return Promise.all(files.map((f) => this.registerUpload(f, uploadedBy)));
  }
}

module.exports = new FileService();
