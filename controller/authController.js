const authService = require("../services/authService");

/**
 * Auth Controller
 * Handles HTTP requests and responses only
 * All business logic is delegated to authService
 */

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        // req.user.id is set by auth middleware
        const result = await authService.getCurrentUser(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
    try {
        const result = await authService.logout();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
};
