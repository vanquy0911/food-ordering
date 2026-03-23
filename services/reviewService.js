const Review = require("../models/review");
const Food = require("../models/food");

/**
 * Review Service
 * Handles business logic for reviews
 */

/**
 * @desc Get all reviews for a food item
 * @param {string} foodId
 * @returns {Promise<Object>}
 */
const getFoodReviews = async (foodId) => {
    const reviews = await Review.find({ food: foodId })
        .populate("user", "name")
        .sort("-createdAt");
    
    return {
        success: true,
        count: reviews.length,
        data: { reviews },
    };
};

/**
 * @desc Create a new review
 * @param {Object} reviewData
 * @returns {Promise<Object>}
 */
const createReview = async (reviewData) => {
    const { foodId, userId, rating, comment } = reviewData;

    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
        const error = new Error("Food not found");
        error.statusCode = 404;
        throw error;
    }

    // Create review (unique index handles duplicate check)
    const review = await Review.create({
        user: userId,
        food: foodId,
        rating,
        comment,
    });

    return {
        success: true,
        data: { review },
    };
};

/**
 * @desc Delete a review
 * @param {string} reviewId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const deleteReview = async (reviewId, userId) => {
    const review = await Review.findById(reviewId);

    if (!review) {
        const error = new Error("Review not found");
        error.statusCode = 404;
        throw error;
    }

    // Check ownership
    if (review.user.toString() !== userId.toString()) {
        const error = new Error("Not authorized to delete this review");
        error.statusCode = 401;
        throw error;
    }

    await review.deleteOne();

    return {
        success: true,
        message: "Review removed",
    };
};

module.exports = {
    getFoodReviews,
    createReview,
    deleteReview,
};
