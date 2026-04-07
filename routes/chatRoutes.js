const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const { protect } = require("../middleware/authMiddleware");

/**
 * Chat Routes
 * Base path: /api/chat
 */

// Get unique users who have chatted (Admin only)
router.get("/users", protect, chatController.getChatUsers);

// Get chat history for a specific user
// Accessible by the user themselves or any admin
router.get("/:userId", protect, chatController.getMessages);

// Mark messages as read
router.put("/:userId/read", protect, chatController.markAsRead);

module.exports = router;
