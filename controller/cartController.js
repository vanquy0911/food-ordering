const cartService = require("../services/cartService");

/**
 * Cart Controller
 * Handles HTTP requests and responses only
 */

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
    try {
        const result = await cartService.getCart(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private
 */
const addItem = async (req, res, next) => {
    try {
        const { foodId, quantity } = req.body;
        const result = await cartService.addItem(req.user.id, foodId, quantity);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
const removeItem = async (req, res, next) => {
    try {
        const result = await cartService.removeItem(req.user.id, req.params.itemId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update item quantity
 * @route   PUT /api/cart/items/:itemId
 * @access  Private
 */
const updateItemQuantity = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const result = await cartService.updateItemQuantity(
            req.user.id,
            req.params.itemId,
            quantity
        );
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
    try {
        const result = await cartService.clearCart(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
};
