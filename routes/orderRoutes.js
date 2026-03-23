const express = require("express");
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
} = require("../controller/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

// Routes that require authentication
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

// Routes that require admin privileges
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
