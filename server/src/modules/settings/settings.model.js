const mongoose = require('mongoose');

// Single-document collection (key/value) for site-wide settings such as
// company info, social links, and future feature flags. Read is cached in
// memory by settings.service to avoid a query on every request.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
