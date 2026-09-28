const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },

    type: {
      type: String,
      enum: [
        'CHURCH_ANNOUNCEMENT', 'UNIT_ANNOUNCEMENT', 'PRAYER_UPDATE', 'EVENT_REMINDER',
        'BIBLE_READING_REMINDER', 'DISCIPLESHIP_REMINDER', 'FOLLOW_UP_ASSIGNMENT', 'ATTENDANCE_REMINDER',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    data: { type: Schema.Types.Mixed },

    channel: { type: String, enum: ['IN_APP', 'EMAIL', 'PUSH'], default: 'IN_APP' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
