const mongoose = require('mongoose');

// Central file registry. Every upload (multer today, MinIO/S3 later) writes
// a record here so ownership, references, and storage backend are tracked
// independently of where the bytes physically live.
const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storage: { type: String, enum: ['local', 's3', 'minio'], default: 'local' },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
