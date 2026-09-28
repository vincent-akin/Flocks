const mongoose = require('mongoose');
const { Schema } = mongoose;

// A single attendance-taking window (e.g. "Sunday Service - Sept 6, 2026").
// The QR token rotates/expires per the security requirements in the PRD:
// dynamic, short-lived, session-specific, one record per member/session.
const attendanceSessionSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' }, // null = organization-wide event
    unit: { type: Schema.Types.ObjectId, ref: 'Unit' }, // set for unit-level attendance
    event: { type: Schema.Types.ObjectId, ref: 'Event' },

    title: { type: String, required: true, trim: true },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date },

    qrTokenHash: { type: String, required: true, select: false },
    qrTokenExpiresAt: { type: Date, required: true },
    qrTokenIssuedAt: { type: Date, default: Date.now },

    // Optional geofencing for the "location validation" option in the PRD
    location: {
      latitude: Number,
      longitude: Number,
      radiusMeters: Number,
    },

    isClosed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

attendanceSessionSchema.index({ organization: 1, parish: 1, scheduledStart: -1 });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
