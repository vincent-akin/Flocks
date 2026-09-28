const mongoose = require('mongoose');
const { Schema } = mongoose;

const prayerRequestSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['HEALTH', 'FAMILY', 'CAREER', 'FINANCE', 'SPIRITUAL', 'MARRIAGE', 'CHILDREN', 'THANKSGIVING', 'OTHER'],
      default: 'OTHER',
    },

    // The member explicitly controls visibility - defaults to the most
    // private setting.
    visibility: { type: String, enum: ['PRIVATE', 'PASTOR_CARE_TEAM', 'CHURCH_WIDE'], default: 'PRIVATE' },

    status: {
      type: String,
      enum: ['SUBMITTED', 'ACTIVE', 'BEING_PRAYED_FOR', 'FOLLOW_UP', 'ANSWERED', 'CONTINUING'],
      default: 'SUBMITTED',
    },

    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

prayerRequestSchema.index({ organization: 1, parish: 1, status: 1 });
prayerRequestSchema.index({ member: 1 });

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
