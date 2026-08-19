const mongoose = require('mongoose');

// Lightweight audit trail. Written by the activityLog service, called from
// service layer methods that mutate important data (not from middleware) so
// each entry can carry meaningful, action-specific metadata.
const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g. "product.create"
    resource: { type: String, required: true }, // e.g. "Product"
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true }
);

activityLogSchema.index({ resource: 1, resourceId: 1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
