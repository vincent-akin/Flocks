const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceRecordSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
    session: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },

    method: { type: String, enum: ['QR', 'MANUAL', 'KIOSK'], default: 'QR' },
    markedAt: { type: Date, default: Date.now },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // set for MANUAL corrections
    location: {
      latitude: Number,
      longitude: Number,
    },
    isCorrection: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Enforces "one attendance record per member/session" at the DB level.
attendanceRecordSchema.index({ session: 1, member: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
