const foodService = require("../services/foodService");

/**
 * Food Controller
 * Handles HTTP requests and responses only
 */

/**
 * @desc    Get all foods
 * @route   GET /api/foods
 * @access  Public
 * @query   category, isAvailable, search
 */
const getAllFoods = async (req, res, next) => {
    try {
        const filters = {
            category: req.query.category,
            isAvailable: req.query.isAvailable,
            search: req.query.search,
        };
        const result = await foodService.getAllFoods(filters);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get food by ID
 * @route   GET /api/foods/:id
 * @access  Public
 */
const getFoodById = async (req, res, next) => {
    try {
        const result = await foodService.getFoodById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new food
 * @route   POST /api/foods
 * @access  Private/Admin
 */
const createFood = async (req, res, next) => {
    try {
        const result = await foodService.createFood(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update food
 * @route   PUT /api/foods/:id
 * @access  Private/Admin
 */
const updateFood = async (req, res, next) => {
    try {
        const result = await foodService.updateFood(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete food
 * @route   DELETE /api/foods/:id
 * @access  Private/Admin
 */
const deleteFood = async (req, res, next) => {
    try {
        const result = await foodService.deleteFood(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
};
