const mongoose = require('mongoose');
const { Schema } = mongoose;

const unitSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true, index: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        'CHOIR', 'MEDIA', 'PROTOCOL', 'USHERING', 'YOUTH', 'CHILDREN',
        'PRAYER', 'EVANGELISM', 'MENS_FELLOWSHIP', 'WOMENS_FELLOWSHIP', 'OTHER',
      ],
      default: 'OTHER',
    },

    // Units are private by default; only members, unit admins, and
    // authorized parish/org admins can view private content.
    isPrivate: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

unitSchema.index({ organization: 1, parish: 1, name: 1 });

module.exports = mongoose.model('Unit', unitSchema);
