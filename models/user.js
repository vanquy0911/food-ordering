const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 👤 User Schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide your name"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please provide your email"],
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        phone: {
            type: String,
            required: [true, "Please provide your phone number"],
            trim: true,
            match: [/^[0-9]{9,11}$/, "Invalid phone number"],
        },

        addresses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Address",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// 📌 Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// 🔐 Hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 🔑 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// 🎫 Generate JWT
userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || "1d",
        }
    );
};

// ⭐ Helper: get default address
userSchema.methods.getDefaultAddress = function () {
    return this.addresses.find((addr) => addr.isDefault);
};

module.exports = mongoose.model("User", userSchema);