const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    deleteUser,
    getUserById,
    getProfile,
    updateProfile,
} = require("../controller/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// User routes (authenticated users only)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Admin routes (admin only)
router.get("/", protect, admin, getAllUsers);
router.get("/:id", protect, admin, getUserById);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
