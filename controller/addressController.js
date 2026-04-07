const addressService = require("../services/addressService");

/**
 * Address Controller
 * Handles HTTP requests and responses only
 */

/**
 * @desc    Get user's addresses
 * @route   GET /api/address
 * @access  Private
 */
const getAddresses = async (req, res, next) => {
    try {
        const result = await addressService.getAddresses(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add new address
 * @route   POST /api/address
 * @access  Private
 */
const addAddress = async (req, res, next) => {
    try {
        const result = await addressService.createAddress(req.user.id, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update address
 * @route   PUT /api/address/:id
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
    try {
        const result = await addressService.updateAddress(req.user.id, req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/address/:id
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
    try {
        const result = await addressService.deleteAddress(req.user.id, req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
};
