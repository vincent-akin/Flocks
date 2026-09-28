const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ organization: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
