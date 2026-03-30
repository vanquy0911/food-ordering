const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            match: [/^[0-9]{9,11}$/, "Invalid phone number"],
        },
        street: {
            type: String,
            required: true,
            trim: true,
        },
        district: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        province: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            default: "Vietnam",
        },
        // OSM Coordination for future map integration
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        formattedAddress: {
            type: String,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexing for faster queries
addressSchema.index({ user: 1 });
addressSchema.index({ isDefault: -1 });

module.exports = mongoose.model("Address", addressSchema);
