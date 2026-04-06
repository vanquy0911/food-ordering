const Order = require("../models/order");
const Payment = require("../models/payment");
const vnpayHelper = require("../utils/vnpayHelper");
const { runInTransaction } = require("../utils/transactionHelper");
const orderService = require("./orderService");

/**
 * Payment Service
 * Handles business logic for payments and transaction management
 */
class PaymentService {
    /**
     * Process VNPay Transaction result (Common logic for Return and IPN)
     * @param {Object} queryData - req.query from VNPay
     * @param {String} type - 'return' or 'ipn'
     * @returns {Object} - Result with status and orderId
     */
    async processVnpayPayment(queryData, type = 'return') {
        const result = type === 'ipn' 
            ? vnpayHelper.verifyIpnCall(queryData)
            : vnpayHelper.verifyReturnUrl(queryData);

        if (!result.isVerified) {
            throw new Error("Invalid VNPay signature");
        }

        const orderId = queryData.vnp_TxnRef;
        const responseCode = queryData.vnp_ResponseCode;
        const transactionNo = queryData.vnp_TransactionNo;
        const amount = queryData.vnp_Amount / 100;

        // Find order and payment
        const order = await Order.findById(orderId);
        if (!order) {
            return { isVerified: true, success: false, rspCode: '01', message: 'Order not found', orderId };
        }

        // Check if amount matches
        if (Math.round(order.totalPrice) !== Math.round(amount)) {
            return { isVerified: true, success: false, rspCode: '04', message: 'Invalid amount', orderId };
        }

        // Check if order is already processed
        if (order.isPaid && responseCode === '00') {
            return { isVerified: true, success: true, rspCode: '02', message: 'Order already confirmed', orderId };
        }

        // EXECUTE UPDATE IN TRANSACTION
        await runInTransaction(async (session) => {
            const updatedOrder = await Order.findById(orderId).session(session);
            const updatedPayment = await Payment.findOne({ order: orderId }).session(session);

            if (responseCode === '00') {
                // Success logic
                updatedOrder.isPaid = true;
                updatedOrder.status = 'confirmed';
                
                if (updatedPayment) {
                    updatedPayment.paymentStatus = 'completed';
                    updatedPayment.transactionId = transactionNo;
                    updatedPayment.paidAt = new Date();
                    updatedPayment.paymentResponse = queryData;
                    await updatedPayment.save({ session });
                }
            } else {
                // Failure or Cancel logic
                updatedOrder.status = 'cancelled';
                
                // ROLLBACK STOCK ON PAYMENT FAILURE
                await orderService.rollbackOrderStock(orderId, session);

                if (updatedPayment) {
                    updatedPayment.paymentStatus = 'failed';
                    updatedPayment.paymentResponse = queryData;
                    await updatedPayment.save({ session });
                }
            }

            await updatedOrder.save({ session });
        });

        const success = responseCode === '00';
        return { 
            isValid: true, 
            success, 
            rspCode: '00', 
            message: 'Success', 
            orderId,
            status: success ? 'success' : 'failed'
        };
    }
}

module.exports = new PaymentService();
