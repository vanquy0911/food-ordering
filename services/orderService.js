const Order = require("../models/order");
const Cart = require("../models/cart");
const Food = require("../models/food");

/**
 * Order Service
 * Handles order management business logic and database operations
 */
class OrderService {
    /**
     * Create a new order from user's cart
     * @param {String} userId - User ID
     * @param {Object} orderData - Order details (address, phone, paymentMethod)
     * @returns {Object} - Created order
     */
    async createOrder(userId, orderData) {
        const { address, phone, paymentMethod, items: bodyItems } = orderData;

        let cartItems = [];
        let isCartFromDb = false;

        if (bodyItems && bodyItems.length > 0) {
            cartItems = bodyItems;
        } else {
            // 1. Get user cart from DB
            const cart = await Cart.findOne({ user: userId }).populate("items.food");

            if (!cart || cart.items.length === 0) {
                const error = new Error("Your cart is empty");
                error.statusCode = 400;
                throw error;
            }
            cartItems = cart.items;
            isCartFromDb = true;
        }

        // 2. Map cart items to order items and calculate total, check stock
        let totalPrice = 0;
        const orderItems = [];

        for (const item of cartItems) {
            // If from payload, `item.food` is the ID string. If from DB Cart, it's populated object
            const foodId = isCartFromDb ? item.food._id : item.food;
            const food = await Food.findById(foodId);

            // Check if food still exists and is available
            if (!food || !food.isAvailable) {
                const error = new Error(`Item ${food ? food.name : 'Unknown'} is currently unavailable`);
                error.statusCode = 400;
                throw error;
            }

            // Check stock
            if (food.stock < item.quantity) {
                const error = new Error(`Not enough stock for ${food.name}. Only ${food.stock} left.`);
                error.statusCode = 400;
                throw error;
            }

            // Map to order item structure preserving historical name and price
            const orderItem = {
                food: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity,
            };

            orderItems.push(orderItem);
            totalPrice += food.price * item.quantity;
        }

        // 3. Create Order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalPrice,
            address,
            phone,
            paymentMethod,
            status: "pending",
            isPaid: false, // In a real app, this would be updated after payment gateway confirms
        });

        // 4. Decrease stock of foods
        for (const item of orderItems) {
            await Food.findByIdAndUpdate(item.food, {
                $inc: { stock: -item.quantity },
            });
        }

        // 5. Clear user cart if it was from DB
        if (isCartFromDb) {
            const cartToClear = await Cart.findOne({ user: userId });
            if (cartToClear) {
                cartToClear.items = [];
                await cartToClear.save();
            }
        }

        return {
            success: true,
            message: "Order placed successfully",
            data: {
                order,
            },
        };
    }

    /**
     * Get orders for the current logged in user
     * @param {String} userId
     * @returns {Object} - List of orders
     */
    async getMyOrders(userId) {
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        return {
            success: true,
            count: orders.length,
            data: {
                orders,
            },
        };
    }

    /**
     * Get all orders (Admin)
     * @returns {Object} - List of all orders
     */
    async getAllOrders() {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return {
            success: true,
            count: orders.length,
            data: {
                orders,
            },
        };
    }

    /**
     * Get single order by ID
     * @param {String} orderId
     * @param {String} userId - ID of user requesting (to check permissions)
     * @param {String} userRole - Role of user requesting
     * @returns {Object} - Order details
     */
    async getOrderById(orderId, userId, userRole) {
        const order = await Order.findById(orderId).populate("user", "name email");

        if (!order) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            throw error;
        }

        // Make sure user owns the order OR is an admin
        if (order.user._id.toString() !== userId && userRole !== "admin") {
            const error = new Error("Not authorized to view this order");
            error.statusCode = 403;
            throw error;
        }

        return {
            success: true,
            data: {
                order,
            },
        };
    }

    /**
     * Update order status (Admin)
     * @param {String} orderId
     * @param {String} status - New status
     * @returns {Object} - Updated order
     */
    async updateOrderStatus(orderId, status) {
        const validStatuses = ["pending", "confirmed", "delivering", "completed", "cancelled"];

        if (!validStatuses.includes(status)) {
            const error = new Error("Invalid status");
            error.statusCode = 400;
            throw error;
        }

        const order = await Order.findById(orderId);

        if (!order) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            throw error;
        }

        order.status = status;

        // If order is completed, mark as paid (simplified logic)
        if (status === "completed" && order.paymentMethod === "cash") {
            order.isPaid = true;
        }

        // If order is cancelled, we should ideally restore stock. (Left as an exercise/future improvement)
        if (status === "cancelled") {
            for (const item of order.items) {
                await Food.findByIdAndUpdate(item.food, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        await order.save();

        return {
            success: true,
            data: {
                order,
            },
        };
    }
}

module.exports = new OrderService();
