const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide food name"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Please provide food price"],
            min: [0, "Price cannot be negative"],
        },
        image: {
            type: String,
            default: "default-food.jpg",
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please provide food category"],
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create text index on name for search functionality
foodSchema.index({ name: "text" });

// Create index on category for faster filtering
foodSchema.index({ category: 1 });

module.exports = mongoose.model("Food", foodSchema);
