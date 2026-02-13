const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
    },
    name: {
        type: String,
        required: true, // Snapshot of food name at time of order
    },
    price: {
        type: Number,
        required: true, // Snapshot of food price at time of order
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
    },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [orderItemSchema],
        totalPrice: {
            type: Number,
            required: true,
            min: [0, "Total price cannot be negative"],
        },
        address: {
            type: String,
            required: [true, "Please provide delivery address"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Please provide contact phone number"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "delivering", "completed", "cancelled"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "momo", "stripe"],
            default: "cash",
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes for common queries
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // For sorting by newest first

module.exports = mongoose.model("Order", orderSchema);
