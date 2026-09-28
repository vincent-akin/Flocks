const mongoose = require('mongoose');
const { Schema } = mongoose;

const unitMembershipSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },

    isUnitAdmin: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    isActive: { type: Boolean, default: true },

    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

unitMembershipSchema.index({ unit: 1, member: 1 }, { unique: true });

module.exports = mongoose.model('UnitMembership', unitMembershipSchema);
