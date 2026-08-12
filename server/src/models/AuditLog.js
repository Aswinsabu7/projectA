const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../constants/roles');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
      index: true,
    },
    module: { type: String, required: true, index: true }, // e.g. 'Subscriber', 'User', 'Role', 'Auth'
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, default: '' },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    performedByUsername: { type: String, default: 'system' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
