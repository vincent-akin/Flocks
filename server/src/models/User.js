import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/index.js';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        profilePicture: {
            type: String,
            default: null
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChurchOrganization',
            required: [true, 'Organization ID is required'],
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        lastLogin: {
            type: Date,
            default: null
        },
        refreshToken: {
            type: String,
            select: false
        },
        preferences: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(config.bcrypt.rounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for member profile
userSchema.virtual('member', {
    ref: 'Member',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

// Exclude sensitive fields
userSchema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
    }
});

export const User = mongoose.model('User', userSchema);
export default User;