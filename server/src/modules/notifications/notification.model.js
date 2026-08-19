const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    // target scope determines who should see it; combined with `recipients`
    // and `targetRole` to support "all / by group / by specific user".
    targetType: {
      type: String,
      enum: ['all', 'role', 'user'],
      required: true,
    },
    targetRole: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }, // used when targetType = 'role'
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // used when targetType = 'user'

    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

notificationSchema.index({ targetType: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
