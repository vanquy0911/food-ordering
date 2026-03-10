const express = require("express");
const router = express.Router();
const {
    getCart,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
} = require("../controller/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require authentication
router.get("/", protect, getCart);
router.post("/items", protect, addItem);
router.put("/items/:itemId", protect, updateItemQuantity);
router.delete("/items/:itemId", protect, removeItem);
router.delete("/", protect, clearCart);

module.exports = router;
