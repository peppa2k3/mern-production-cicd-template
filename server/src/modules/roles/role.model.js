const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    displayName: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false }, // system roles cannot be deleted
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
