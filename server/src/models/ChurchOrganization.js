const mongoose = require('mongoose');
const { Schema } = mongoose;

const churchOrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    logoUrl: { type: String },
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    timezone: { type: String, default: 'Africa/Lagos' },

    settings: {
      allowMemberSelfRegistration: { type: Boolean, default: false },
      defaultParish: { type: Schema.Types.ObjectId, ref: 'Parish' },
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChurchOrganization', churchOrganizationSchema);
