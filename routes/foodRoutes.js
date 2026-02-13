const express = require("express");
const router = express.Router();
const {
    getAllFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
} = require("../controller/foodController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllFoods);
router.get("/:id", getFoodById);

// Admin routes
router.post("/", protect, admin, createFood);
router.put("/:id", protect, admin, updateFood);
router.delete("/:id", protect, admin, deleteFood);

module.exports = router;
