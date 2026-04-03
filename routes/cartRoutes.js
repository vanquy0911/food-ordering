const express = require("express");
const router = express.Router();
const {
    getCart,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    syncCart,
} = require("../controller/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require authentication
router.get("/", protect, getCart);
router.post("/items", protect, addItem);
router.post("/sync", protect, syncCart);
router.put("/items/:itemId", protect, updateItemQuantity);
router.delete("/items/:itemId", protect, removeItem);
router.delete("/", protect, clearCart);

module.exports = router;
