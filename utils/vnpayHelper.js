const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

/**
 * VNPay Helper Utility
 * Handles payment URL generation and hash verification
 */
class VNPayHelper {
    constructor() {
        this.vnpay = new VNPay({
            tmnCode: 'VWG3OSC6', // Default sandbox TmnCode
            secureSecret: 'KYGHTVKJYN6DPIQACACAMNVVANBOTVL0', // Default sandbox Secret
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: 'SHA512',
            loggerFn: ignoreLogger,
        });
    }

    /**
     * Generate VNPay Payment URL
     * @param {Object} order - Order object from database
     * @param {String} ipAddr - Client IP address
     * @returns {String} - Payment URL
     */
    generatePaymentUrl(order, ipAddr = '127.0.0.1') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // VNPay library automatically multiplies by 100
        const amount = Math.round(order.totalPrice);

        const paymentUrl = this.vnpay.buildPaymentUrl({
            vnp_Amount: amount,
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: order._id.toString(), // Use Order ID as reference
            vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payment/vnpay-return', // Backend API handle first
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow),
        });

        console.log("🔗 VNPay Payment URL Generated:", paymentUrl);
        return paymentUrl;
    }

    /**
     * Verify VNPay Return response (Browser redirect)
     * @param {Object} query - req.query from VNPay
     */
    verifyReturnUrl(query) {
        return this.vnpay.verifyReturnUrl(query);
    }

    /**
     * Verify VNPay IPN response (Server-to-Server)
     * @param {Object} query - req.query from VNPay
     */
    verifyIpnCall(query) {
        return this.vnpay.verifyIpnCall(query);
    }
}

module.exports = new VNPayHelper();
