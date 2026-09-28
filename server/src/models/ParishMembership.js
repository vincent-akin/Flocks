const mongoose = require('mongoose');
const { Schema } = mongoose;

// Historical record of every parish a member has belonged to. Preserving
// this history (rather than overwriting the member's parish field) is a
// hard architecture invariant of Flocks.
const parishMembershipSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true },

    joinedAt: { type: Date, required: true, default: Date.now },
    leftAt: { type: Date }, // null while this is the current/active membership
    transferReason: { type: String, trim: true },

    isCurrent: { type: Boolean, default: true },

    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

parishMembershipSchema.index({ member: 1, isCurrent: 1 });

module.exports = mongoose.model('ParishMembership', parishMembershipSchema);
