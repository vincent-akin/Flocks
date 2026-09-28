const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ROLES, SCOPE_TYPES, ALL_PERMISSIONS } = require('../permissions/permissions');

const roleAssignmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },

    role: { type: String, enum: Object.values(ROLES), required: true },

    // scopeType + scopeId together define what resource subtree this
    // assignment covers. For ORGANIZATION scope, scopeId === organization.
    scopeType: { type: String, enum: Object.values(SCOPE_TYPES), required: true },
    scopeId: { type: Schema.Types.ObjectId, required: true },

    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((p) => ALL_PERMISSIONS.includes(p)),
        message: 'Unknown permission supplied to role assignment',
      },
    },

    status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE' },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    revokedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

roleAssignmentSchema.index({ user: 1, organization: 1, status: 1 });
roleAssignmentSchema.index({ scopeType: 1, scopeId: 1 });

module.exports = mongoose.model('RoleAssignment', roleAssignmentSchema);
