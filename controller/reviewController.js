const reviewService = require("../services/reviewService");

/**
 * Review Controller
 * Handles HTTP requests and responses for reviews
 */

/**
 * @desc    Get reviews for a food
 * @route   GET /api/reviews/food/:foodId
 * @access  Public
 */
const getFoodReviews = async (req, res, next) => {
    try {
        const result = await reviewService.getFoodReviews(req.params.foodId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
    try {
        const result = await reviewService.createReview({
            ...req.body,
            userId: req.user._id,
        });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
    try {
        const result = await reviewService.deleteReview(req.params.id, req.user._id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFoodReviews,
    createReview,
    deleteReview,
};
