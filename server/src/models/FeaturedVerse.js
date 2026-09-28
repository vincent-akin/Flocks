const mongoose = require('mongoose');
const { Schema } = mongoose;

// Verse of the Day / Week / Year. Scoped to organization (Super Admin
// configures these organization-wide).
const featuredVerseSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    type: { type: String, enum: ['DAILY', 'WEEKLY', 'YEARLY'], required: true },

    reference: { type: String, required: true, trim: true }, // e.g. "Romans 8:28"
    text: { type: String, required: true, trim: true },
    translation: { type: String, default: 'KJV', trim: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    setBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

featuredVerseSchema.index({ organization: 1, type: 1, startDate: -1 });

module.exports = mongoose.model('FeaturedVerse', featuredVerseSchema);
