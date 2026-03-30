const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controller/settingController");
const { protect, admin } = require("../middleware/authMiddleware");

// @route GET /api/settings
router.get("/", getSettings);

// @route PUT /api/settings
// Only Admin can update settings
router.put("/", protect, admin, updateSettings);

module.exports = router;
