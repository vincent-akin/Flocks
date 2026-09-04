import mongoose from 'mongoose';

const churchOrganizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true,
            maxlength: [100, 'Organization name cannot exceed 100 characters']
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        settings: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Generate slug before saving
churchOrganizationSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    next();
});

// Virtual for parishes
churchOrganizationSchema.virtual('parishes', {
    ref: 'Parish',
    localField: '_id',
    foreignField: 'organizationId'
});

// Static method to find by slug
churchOrganizationSchema.statics.findBySlug = function(slug) {
    return this.findOne({ slug });
};

export const ChurchOrganization = mongoose.model('ChurchOrganization', churchOrganizationSchema);
export default ChurchOrganization;