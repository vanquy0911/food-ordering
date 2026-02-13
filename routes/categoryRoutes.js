const express = require("express");
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controller/categoryController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
