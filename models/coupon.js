const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Please provide coupon code"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxDiscountAmount: {
            type: Number,
            min: 0,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        usageLimit: {
            type: Number,
            default: null, // null means unlimited
        },
        usageLimitPerUser: {
            type: Number,
            default: 1, // Default 1 use per user
        },
        usedByUsers: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            count: {
                type: Number,
                default: 1,
            }
        }],
        usedCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast lookup by code
couponSchema.index({ code: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
