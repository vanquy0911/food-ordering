const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const paymentController = require('../controller/paymentController');

/**
 * Payment Routes
 * Base path: /api/payment
 */

// Return URL (GET) - For client browser redirect
router.get('/vnpay-return', asyncHandler(paymentController.vnpayReturn));

// IPN URL (GET) - For VNPay server callback
router.get('/vnpay-ipn', asyncHandler(paymentController.vnpayIpn));

module.exports = router;
