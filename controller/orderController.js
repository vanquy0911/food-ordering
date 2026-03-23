const orderService = require("../services/orderService");

/**
 * Order Controller
 * Handles HTTP requests and responses for orders
 */

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
    try {
        const result = await orderService.createOrder(req.user.id, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
    try {
        const result = await orderService.getMyOrders(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrders();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Owner or Admin)
 */
const getOrderById = async (req, res, next) => {
    try {
        const result = await orderService.getOrderById(
            req.params.id,
            req.user.id,
            req.user.role
        );
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const result = await orderService.updateOrderStatus(
            req.params.id,
            req.body.status
        );
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel order by user
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
    try {
        const result = await orderService.cancelOrder(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};
