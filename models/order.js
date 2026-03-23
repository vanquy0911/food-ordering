const mongoose = require("mongoose");

// Schema cho từng món trong đơn hàng
const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
    },
    name: {
        type: String,
        required: true, // Snapshot tên món tại thời điểm đặt
    },
    image: {
        type: String, // Snapshot ảnh món
    },
    price: {
        type: Number,
        required: true, // Snapshot giá món tại thời điểm đặt
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
    },
});

// Schema địa chỉ giao hàng
const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: [true, "Please provide street"],
        trim: true,
    },
    city: {
        type: String,
        required: [true, "Please provide city"],
        trim: true,
    },
    district: {
        type: String,
        required: [true, "Please provide district"],
        trim: true,
    },
});

// Schema chính của Order
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: [0, "Total price cannot be negative"],
        },

        address: addressSchema,

        phone: {
            type: String,
            required: [true, "Please provide contact phone number"],
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled", "completed"],
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

// Indexes để query nhanh hơn
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);