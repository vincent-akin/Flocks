const mongoose = require('mongoose');
const { Schema } = mongoose;

// A member's progress against a BiblePlan.
const bibleReadingSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: 'BiblePlan', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },

    daysCompleted: { type: [Number], default: [] }, // day numbers marked complete
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastReadAt: { type: Date },
    notes: [
      {
        day: Number,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bibleReadingSchema.index({ plan: 1, member: 1 }, { unique: true });

bibleReadingSchema.virtual('completionPercentage').get(function completionPercentage() {
  // Populated plan is required to compute this accurately; controllers
  // compute and attach it explicitly when returning to clients.
  return undefined;
});

module.exports = mongoose.model('BibleReading', bibleReadingSchema);
