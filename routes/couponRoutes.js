const express = require("express");
const router = express.Router();
const {
    validateCoupon,
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} = require("../controller/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/validate", protect, validateCoupon);

// Admin routes
router.get("/", protect, admin, getCoupons);
router.get("/:id", protect, admin, getCouponById);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
