const mongoose = require('mongoose');
const { Schema } = mongoose;

const MEMBERSHIP_STATUS = ['NEW', 'ACTIVE', 'INACTIVE', 'TRANSFERRED', 'MOVED_AWAY', 'DECEASED'];
const BAPTISM_STATUS = ['NOT_BAPTIZED', 'BAPTIZED', 'BAPTISM_PENDING'];
const DISCIPLESHIP_STATUS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

const memberSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'ChurchOrganization', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // null until the member has a login

    primaryParish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true, index: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    preferredName: { type: String, trim: true },
    profilePhotoUrl: { type: String },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'], default: 'UNSPECIFIED' },
    dateOfBirth: { type: Date },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true },
    },

    membershipStatus: { type: String, enum: MEMBERSHIP_STATUS, default: 'NEW' },
    baptismStatus: { type: String, enum: BAPTISM_STATUS, default: 'NOT_BAPTIZED' },
    discipleshipStatus: { type: String, enum: DISCIPLESHIP_STATUS, default: 'NOT_STARTED' },

    joinedChurchAt: { type: Date, default: Date.now },

    family: [
      {
        member: { type: Schema.Types.ObjectId, ref: 'Member' },
        relationship: {
          type: String,
          enum: ['SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'GUARDIAN'],
        },
      },
    ],

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

memberSchema.index({ organization: 1, primaryParish: 1 });
memberSchema.index({ organization: 1, lastName: 1, firstName: 1 });

memberSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});
memberSchema.set('toJSON', { virtuals: true });
memberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
module.exports.MEMBERSHIP_STATUS = MEMBERSHIP_STATUS;
module.exports.BAPTISM_STATUS = BAPTISM_STATUS;
module.exports.DISCIPLESHIP_STATUS = DISCIPLESHIP_STATUS;
