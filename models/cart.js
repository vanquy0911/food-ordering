const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
        default: 1,
    },
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One cart per user
        },
        items: [cartItemSchema],
    },
    {
        timestamps: true,
    }
);

// Create index on user for faster queries
cartSchema.index({ user: 1 });

module.exports = mongoose.model("Cart", cartSchema);
