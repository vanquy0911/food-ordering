const categoryService = require("../services/categoryService");

/**
 * Category Controller
 * Handles HTTP requests and responses only
 */

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
    try {
        const result = await categoryService.getAllCategories();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
    try {
        const result = await categoryService.getCategoryById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
    try {
        const result = await categoryService.createCategory(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
    try {
        const result = await categoryService.updateCategory(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
    try {
        const result = await categoryService.deleteCategory(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
