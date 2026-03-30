const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "VND",
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ["cash", "momo", "vnpay"],
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },
        transactionId: {
            type: String,
        },
        paymentResponse: {
            type: Object,
        },
        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster lookups
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
