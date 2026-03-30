const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        // One unique instance for shop settings
        title: {
            type: String,
            default: "Shop Settings",
        },
        shopLocation: {
            lat: {
                type: Number,
                required: true,
                default: 10.762622, // Default coordinate (e.g., HCM City)
            },
            lng: {
                type: Number,
                required: true,
                default: 106.660172,
            },
        },
        shopAddress: {
            type: String
        },
        shippingConfig: {
            baseFee: {
                type: Number,
                default: 15000, // Default base fee in VND
                min: [0, "Base fee cannot be negative"],
            },
            perKmFee: {
                type: Number,
                default: 5000, // Additional fee per km
                min: [0, "Per km fee cannot be negative"],
            },
            freeShipThreshold: {
                type: Number,
                default: 500000, // Free ship for orders over this amount
                min: [0, "Free ship threshold cannot be negative"],
            },
            maxDeliveryDistance: {
                type: Number,
                default: 15, // Maximum distance in km
                min: [0, "Max delivery distance cannot be negative"],
            },
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

module.exports = mongoose.model("Setting", settingSchema);