const paymentService = require("../services/paymentService");
const vnpayHelper = require("../utils/vnpayHelper");
const { runInTransaction } = require("../utils/transactionHelper");

/**
 * Payment Controller
 * Handles VNPay return and IPN callbacks (HTTP Layer Only)
 */
class PaymentController {
    /**
     * Handle VNPay Return URL (Browser redirect)
     * GET /api/payment/vnpay-return
     */
    async vnpayReturn(req, res) {
        try {
            const result = await paymentService.processVnpayPayment(req.query, 'return');

            const frontendUrl = (process.env.CLIENT_URL || 'http://localhost:8080').trim();
            return res.redirect(`${frontendUrl}/payment-status?status=${result.status}&orderId=${result.orderId}`);
        } catch (error) {
            console.error("❌ VNPay Return Error:", error);
            const frontendUrl = (process.env.CLIENT_URL || 'http://localhost:8080').trim();
            res.redirect(`${frontendUrl}/payment-status?status=error`);
        }
    }

    /**
     * Handle VNPay IPN (Server-to-Server)
     * GET /api/payment/vnpay-ipn
     */
    async vnpayIpn(req, res) {
        try {
            const result = await paymentService.processVnpayPayment(req.query, 'ipn');

            if (!result.isVerified) {
                return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
            }

            res.status(200).json({ RspCode: result.rspCode, Message: result.message });
        } catch (error) {
            console.error("❌ VNPay IPN Error:", error);
            res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
        }
    }
}

module.exports = new PaymentController();
