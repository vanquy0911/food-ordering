const couponService = require("../services/couponService");

/**
 * @desc    Validate coupon code
 * @route   POST /api/coupons/validate
 * @access  Private
 */
const validateCoupon = async (req, res, next) => {
    try {
        const { code, cartTotal } = req.body;
        const result = await couponService.validateCoupon(code, cartTotal, req.user.id);
        
        res.status(200).json({
            success: true,
            data: {
                code: result.coupon.code,
                discountType: result.coupon.discountType,
                discountValue: result.coupon.discountValue,
                discountAmount: result.discountAmount,
                finalTotal: result.finalTotal,
                cartTotal: result.cartTotal
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
const getCoupons = async (req, res, next) => {
    try {
        const coupons = await couponService.getAllCoupons();
        res.status(200).json({ success: true, count: coupons.length, data: { coupons } });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create coupon (Admin)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
const createCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.createCoupon(req.body);
        res.status(201).json({ success: true, data: { coupon } });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
const deleteCoupon = async (req, res, next) => {
    try {
        await couponService.deleteCoupon(req.params.id);
        res.status(200).json({ success: true, message: "Coupon deleted" });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get coupon by ID (Admin)
 * @route   GET /api/coupons/:id
 * @access  Private/Admin
 */
const getCouponById = async (req, res, next) => {
    try {
        const coupon = await couponService.getCouponById(req.params.id);
        res.status(200).json({ success: true, data: { coupon } });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update coupon (Admin)
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
const updateCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.updateCoupon(req.params.id, req.body);
        res.status(200).json({ success: true, data: { coupon } });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCoupon,
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
