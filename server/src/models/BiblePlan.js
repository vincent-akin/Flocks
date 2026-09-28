const mongoose = require('mongoose');
const { Schema } = mongoose;

const biblePlanSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' }, // null = organization-wide plan

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    planType: {
      type: String,
      enum: ['SEVEN_DAY', 'FOURTEEN_DAY', 'THIRTY_DAY', 'NINETY_DAY', 'ONE_EIGHTY_DAY', 'THREE_SIXTY_FIVE_DAY', 'CUSTOM'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Ordered list of daily readings
    dailyReadings: [
      {
        day: { type: Number, required: true },
        date: { type: Date },
        references: [{ type: String, trim: true }],
        title: { type: String, trim: true },
      },
    ],

    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

biblePlanSchema.index({ organization: 1, isPublished: 1 });

module.exports = mongoose.model('BiblePlan', biblePlanSchema);
