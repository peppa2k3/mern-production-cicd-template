const path = require('path');
const File = require('./file.model');
const env = require('../../config/env');

class FileService {
  // Registers an uploaded file (written to disk by multer) in the Files
  // collection and returns its public URL. Swapping `storage` to 's3' or
  // 'minio' later only requires changing this method + upload.middleware,
  // not any controller that calls it.
  async registerUpload(file, uploadedBy) {
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
