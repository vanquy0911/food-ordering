const Coupon = require("../models/coupon");
const mongoose = require("mongoose");

class CouponService {
    /**
     * Validate a coupon code against a cart total and user
     * @param {String} code - Coupon code
     * @param {Number} cartTotal - Current cart total
     * @param {String} userId - ID of the user applying the coupon
     * @returns {Object} - Coupon details and calculated discount
     */
    async validateCoupon(code, cartTotal, userId = null) {
        // 1. Basic Input Validation
        if (!code || typeof code !== 'string') {
            const error = new Error("Please provide a valid coupon code");
            error.statusCode = 400;
            throw error;
        }

        if (!cartTotal || cartTotal <= 0) {
            const error = new Error("Invalid cart total for coupon application");
            error.statusCode = 400;
            throw error;
        }

        // 2. Find Coupon
        const coupon = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            const error = new Error("Invalid or inactive coupon code");
            error.statusCode = 404;
            throw error;
        }

        // 3. Expiry Validation
        if (coupon.expiryDate) {
            if (new Date() > new Date(coupon.expiryDate)) {
                const error = new Error("Coupon has expired");
                error.statusCode = 400;
                throw error;
            }
        }

        // 4. Global Usage Limit Validation
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            const error = new Error("Coupon overall usage limit reached");
            error.statusCode = 400;
            throw error;
        }

        // 5. Per-User Usage Limit Validation
        if (userId && coupon.usageLimitPerUser !== null) {
            const userUsage = coupon.usedByUsers.find(u => u.user.toString() === userId.toString());
            const userUsedCount = userUsage ? userUsage.count : 0;

            if (userUsedCount >= coupon.usageLimitPerUser) {
                const error = new Error(`You have already used this coupon the maximum number of times (${coupon.usageLimitPerUser})`);
                error.statusCode = 400;
                throw error;
            }
        }

        // 6. Minimum Order Amount Validation
        if (cartTotal < coupon.minOrderAmount) {
            const error = new Error(`This coupon requires a minimum order amount of $${coupon.minOrderAmount}`);
            error.statusCode = 400;
            throw error;
        }

        // 7. Calculate Discount
        let discountAmount = 0;
        if (coupon.discountType === "percentage") {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        const finalTotal = parseFloat((cartTotal - discountAmount).toFixed(2));

        return {
            coupon,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            finalTotal,
            cartTotal: parseFloat(cartTotal.toFixed(2))
        };
    }

    /**
     * Increment coupon usage count for both global and specific user
     * @param {String} couponId 
     * @param {String} userId 
     * @param {Object} session - Mongoose session for transaction
     */
    async incrementUsage(couponId, userId, session = null) {
        if (!userId) {
            return await Coupon.findByIdAndUpdate(couponId, {
                $inc: { usedCount: 1 },
            }, { session });
        }

        const coupon = await Coupon.findById(couponId).session(session);
        if (!coupon) return;

        coupon.usedCount += 1;

        const userIndex = coupon.usedByUsers.findIndex(u => u.user.toString() === userId.toString());
        if (userIndex > -1) {
            coupon.usedByUsers[userIndex].count += 1;
        } else {
            coupon.usedByUsers.push({ user: userId, count: 1 });
        }

        await coupon.save({ session });
    }

    /**
     * Get all coupons
     */
    async getAllCoupons() {
        return await Coupon.find().sort({ createdAt: -1 });
    }

    /**
     * Get coupon by ID
     */
    async getCouponById(id) {
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            const error = new Error("Coupon not found");
            error.statusCode = 404;
            throw error;
        }
        return coupon;
    }

    /**
     * Create a new coupon with validation
     */
    async createCoupon(data) {
        if (!data.code || !data.discountType || data.discountValue === undefined) {
            const error = new Error("Missing required coupon fields (code, type, value)");
            error.statusCode = 400;
            throw error;
        }
        return await Coupon.create(data);
    }

    /**
     * Update a coupon
     */
    async updateCoupon(id, data) {
        return await Coupon.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }

    /**
     * Delete a coupon
     */
    async deleteCoupon(id) {
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) {
            const error = new Error("Coupon not found");
            error.statusCode = 404;
            throw error;
        }
        return coupon;
    }
}

module.exports = new CouponService();
