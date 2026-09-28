const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },

    // Scope determines visibility. Exactly one of parish/unit should be
    // set depending on scopeType (both null for ORGANIZATION scope).
    scopeType: { type: String, enum: ['ORGANIZATION', 'PARISH', 'UNIT', 'ADMIN_ONLY'], required: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit' },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: [
        'SUNDAY_SERVICE', 'BIBLE_STUDY', 'PRAYER_MEETING', 'UNIT_MEETING',
        'SMALL_GROUP', 'OUTREACH', 'CONFERENCE', 'DISCIPLESHIP_CLASS',
        'LEADERSHIP_MEETING', 'SPECIAL_EVENT',
      ],
      default: 'SPECIAL_EVENT',
    },

    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    location: { type: String, trim: true },

    createsAttendanceSession: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSchema.index({ organization: 1, startsAt: 1 });
eventSchema.index({ organization: 1, parish: 1, startsAt: 1 });
eventSchema.index({ organization: 1, unit: 1, startsAt: 1 });

module.exports = mongoose.model('Event', eventSchema);
