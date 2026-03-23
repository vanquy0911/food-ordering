const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Review must belong to a user"],
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: [true, "Review must belong to a food item"],
        },
        rating: {
            type: Number,
            required: [true, "Please provide a rating between 1 and 5"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating must be at most 5"],
        },
        comment: {
            type: String,
            required: [true, "Please provide a review comment"],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from submitting more than one review per food item
reviewSchema.index({ food: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
