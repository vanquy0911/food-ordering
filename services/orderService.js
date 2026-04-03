const Order = require("../models/order");
const Cart = require("../models/cart");
const Food = require("../models/food");
const Payment = require("../models/payment");
const IdempotencyKey = require("../models/idempotencyKey");
const SettingLocation = require("../models/settinglocation");
const { calculateDistance } = require("../utils/distance");
const couponService = require("../services/couponService");
const { getIO } = require("../config/socket");
const { runInTransaction } = require("../utils/transactionHelper");

/**
 * Order Service
 * Handles order management business logic and database operations
 */
class OrderService {
    /**
     * Create a new order from user's cart
     * @param {String} userId - User ID
     * @param {Object} orderData - Order details (address, phone, paymentMethod)
     * @param {String} idempotencyKey - Unique key to prevent duplicates
     * @returns {Object} - Created order or cached response
     */
    async createOrder(userId, orderData, idempotencyKey = null) {
        const { address, phone, paymentMethod, items: bodyItems, couponCode } = orderData;

        // --- 1. IDEMPOTENCY CHECK ---
        if (idempotencyKey) {
            const existing = await IdempotencyKey.findOne({ key: idempotencyKey, userId });
            
            if (existing) {
                if (existing.status === 'processing') {
                    const error = new Error("Your order is being processed. Please do not submit again.");
                    error.statusCode = 409;
                    throw error;
                }
                
                if (existing.status === 'completed') {
                    return {
                        source: 'idempotency_cache',
                        status: existing.responseStatus,
                        ...existing.responseBody
                    };
                }
            }

            // Create initial processing record
            await IdempotencyKey.create({
                key: idempotencyKey,
                userId,
                requestPath: '/api/orders',
                status: 'processing'
            });
        }

        try {
            // --- 2. EXECUTION WITHIN TRANSACTION ---
            const result = await runInTransaction(async (session) => {
                let cartItems = [];
                let isCartFromDb = false;

                if (bodyItems && bodyItems.length > 0) {
                    cartItems = bodyItems;
                } else {
                    const cart = await Cart.findOne({ user: userId }).session(session).populate("items.food");

                    if (!cart || cart.items.length === 0) {
                        const error = new Error("Your cart is empty");
                        error.statusCode = 400;
                        throw error;
                    }
                    cartItems = cart.items;
                    isCartFromDb = true;
                }

                let totalPrice = 0;
                const orderItems = [];

                for (const item of cartItems) {
                    const foodId = isCartFromDb ? item.food._id : item.food;
                    const food = await Food.findById(foodId).session(session);

                    if (!food || !food.isAvailable) {
                        throw new Error(`Item ${food ? food.name : 'Unknown'} is currently unavailable`);
                    }

                    if (food.stock < item.quantity) {
                        throw new Error(`Not enough stock for ${food.name}. Only ${food.stock} left.`);
                    }

                    orderItems.push({
                        food: food._id,
                        name: food.name,
                        price: food.price,
                        quantity: item.quantity,
                    });
                    totalPrice += food.price * item.quantity;
                }

                let discountAmount = 0;
                let appliedCoupon = null;

                if (couponCode) {
                    try {
                        const res = await couponService.validateCoupon(couponCode, totalPrice, userId);
                        appliedCoupon = res.coupon;
                        discountAmount = res.discountAmount;
                        await couponService.incrementUsage(appliedCoupon._id, userId, session);
                    } catch (err) {
                        console.warn(`Coupon fail: ${err.message}`);
                    }
                }

                let shippingFee = 0;
                const settings = await SettingLocation.findOne({ isActive: true }).session(session);

                if (settings) {
                    const config = settings.shippingConfig;
                    shippingFee = config.baseFee;

                    if (address.latitude && address.longitude) {
                        const distance = calculateDistance(
                            settings.shopLocation.lat,
                            settings.shopLocation.lng,
                            address.latitude,
                            address.longitude
                        );
                        shippingFee += Math.round(distance * config.perKmFee);
                        if (config.maxDeliveryDistance && distance > config.maxDeliveryDistance) {
                            throw new Error(`Distance limit exceeded: ${config.maxDeliveryDistance}km`);
                        }
                    }

                    if (totalPrice >= config.freeShipThreshold) shippingFee = 0;
                }

                const finalTotalPrice = parseFloat((totalPrice + shippingFee - discountAmount).toFixed(2));

                const [order] = await Order.create([{
                    user: userId,
                    items: orderItems,
                    totalPrice: finalTotalPrice,
                    discountAmount,
                    shippingFee,
                    coupon: appliedCoupon ? appliedCoupon._id : null,
                    address,
                    phone,
                    paymentMethod,
                    status: "pending",
                    isPaid: false,
                }], { session });

                for (const item of orderItems) {
                    await Food.findByIdAndUpdate(item.food, 
                        { $inc: { stock: -item.quantity } },
                        { session, runValidators: true }
                    );
                }

                if (isCartFromDb) {
                    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });
                }

                await Payment.create([{
                    order: order._id,
                    user: userId,
                    amount: finalTotalPrice,
                    paymentMethod,
                    paymentStatus: "pending",
                }], { session });

                return {
                    success: true,
                    message: "Order placed successfully",
                    data: { order },
                };
            });

            // --- 3. PERSIST IDEMPOTENCY SUCCESS ---
            if (idempotencyKey) {
                await IdempotencyKey.findOneAndUpdate(
                    { key: idempotencyKey, userId },
                    { 
                        status: 'completed', 
                        responseStatus: 201, 
                        responseBody: result 
                    }
                );
            }

            return result;

        } catch (error) {
            // --- 4. PERSIST IDEMPOTENCY FAILURE ---
            if (idempotencyKey) {
                await IdempotencyKey.findOneAndUpdate(
                    { key: idempotencyKey, userId },
                    { status: 'failed' }
                );
            }
            throw error;
        }
    }

    // Other methods stay the same...
    async getMyOrders(userId) {
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        return { success: true, count: orders.length, data: { orders } };
    }

    async getAllOrders() {
        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
        return { success: true, count: orders.length, data: { orders } };
    }

    async getOrderById(orderId, userId, userRole) {
        const order = await Order.findById(orderId).populate("user", "name email");
        if (!order) throw new Error("Order not found");
        if (order.user._id.toString() !== userId && userRole !== "admin") throw new Error("Unauthorized");
        return { success: true, data: { order } };
    }

    async updateOrderStatus(orderId, status) {
        const validStatuses = ["pending", "confirmed", "preparing", "delivering", "delivered", "completed", "cancelled"];
        if (!validStatuses.includes(status)) throw new Error("Invalid status");

        return await runInTransaction(async (session) => {
            const order = await Order.findById(orderId).session(session);
            if (!order) throw new Error("Order not found");
            order.status = status;
            if (status === "completed" && order.paymentMethod === "cash") order.isPaid = true;

            if (status === "cancelled") {
                for (const item of order.items) {
                    await Food.findByIdAndUpdate(item.food, { $inc: { stock: item.quantity } }, { session });
                }
            }
            await order.save({ session });

            try {
                getIO().to(`user_${order.user}`).emit("statusUpdate", {
                    orderId: order._id,
                    status: status,
                    message: `Status updated to: ${status}`
                });
            } catch (err) {}
            return { success: true, data: { order } };
        });
    }

    async cancelOrder(orderId, userId) {
        return await runInTransaction(async (session) => {
            const order = await Order.findById(orderId).session(session);
            if (!order || order.user.toString() !== userId) throw new Error("Order not found/Unauthorized");
            if (order.status !== "pending") throw new Error(`Cannot cancel in ${order.status}`);
            order.status = "cancelled";

            for (const item of order.items) {
                await Food.findByIdAndUpdate(item.food, { $inc: { stock: item.quantity } }, { session });
            }
            await order.save({ session });

            try {
                getIO().to(`user_${order.user}`).emit("statusUpdate", {
                    orderId: order._id,
                    status: "cancelled",
                    message: "Cancelled successfully"
                });
            } catch (err) {}
            return { success: true, message: "Cancelled successfully", data: { order } };
        });
    }
}

module.exports = new OrderService();
