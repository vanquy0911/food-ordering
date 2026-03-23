const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/reviews
// @access  Private
router.post("/", protect, reviewController.createReview);

// @route   GET /api/reviews/food/:foodId
// @access  Public
router.get("/food/:foodId", reviewController.getFoodReviews);

// @route   DELETE /api/reviews/:id
// @access  Private
router.delete("/:id", protect, reviewController.deleteReview);

module.exports = router;
