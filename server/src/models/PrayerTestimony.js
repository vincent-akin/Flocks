const mongoose = require('mongoose');
const { Schema } = mongoose;

const prayerTestimonySchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    prayerRequest: { type: Schema.Types.ObjectId, ref: 'PrayerRequest', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },

    testimony: { type: String, required: true, trim: true },

    // The member controls whether this can be shared beyond the original
    // prayer visibility (e.g. on a future church-wide testimony wall).
    isPublicallyShareable: { type: Boolean, default: false },

    moderationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PrayerTestimony', prayerTestimonySchema);
