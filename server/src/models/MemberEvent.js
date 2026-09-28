const mongoose = require('mongoose');
const { Schema } = mongoose;

// Append-only timeline of significant events in a member's journey
// (joined church, baptized, started discipleship, joined a unit, etc.)
// Never overwritten - this is what powers the "Member Journey" view.
const memberEventSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' },

    type: {
      type: String,
      required: true,
      enum: [
        'JOINED_CHURCH',
        'MEMBERSHIP_STATUS_CHANGED',
        'BAPTIZED',
        'DISCIPLESHIP_STARTED',
        'DISCIPLESHIP_LEVEL_COMPLETED',
        'DISCIPLESHIP_COMPLETED',
        'JOINED_UNIT',
        'LEFT_UNIT',
        'PARISH_TRANSFER',
        'OTHER',
      ],
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
    occurredAt: { type: Date, default: Date.now },

    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

memberEventSchema.index({ member: 1, occurredAt: -1 });

module.exports = mongoose.model('MemberEvent', memberEventSchema);
