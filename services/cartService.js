const Cart = require("../models/cart");
const Food = require("../models/food");

/**
 * Cart Service
 * Handles cart management business logic and database operations
 */
class CartService {
    /**
     * Get cart of current user
     * @param {String} userId
     * @returns {Object} - Cart with items
     */
    async getCart(userId) {
        let cart = await Cart.findOne({ user: userId }).populate(
            "items.food",
            "name price image isAvailable stock"
        );

        if (!cart) {
            return {
                success: true,
                data: {
                    cart: {
                        items: [],
                        totalItems: 0,
                        totalPrice: 0,
                    },
                },
            };
        }

        const totalPrice = cart.items.reduce((sum, item) => {
            return sum + item.food.price * item.quantity;
        }, 0);

        return {
            success: true,
            data: {
                cart: {
                    id: cart._id,
                    items: cart.items.map((item) => ({
                        id: item._id,
                        food: item.food,
                        quantity: item.quantity,
                        subtotal: item.food.price * item.quantity,
                    })),
                    totalItems: cart.items.length,
                    totalPrice,
                },
            },
        };
    }

    /**
     * Add item to cart (or increase quantity if already exists)
     * @param {String} userId
     * @param {String} foodId
     * @param {Number} quantity
     * @returns {Object} - Updated cart
     */
    async addItem(userId, foodId, quantity = 1) {
        // Validate quantity
        if (quantity < 1) {
            const error = new Error("Quantity must be at least 1");
            error.statusCode = 400;
            throw error;
        }

        // Check food exists and is available
        const food = await Food.findById(foodId);
        if (!food) {
            const error = new Error("Food not found");
            error.statusCode = 404;
            throw error;
        }
        if (!food.isAvailable) {
            const error = new Error("This food item is currently unavailable");
            error.statusCode = 400;
            throw error;
        }
        if (food.stock < quantity) {
            const error = new Error(`Only ${food.stock} items left in stock`);
            error.statusCode = 400;
            throw error;
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Check if food already in cart
        const existingItem = cart.items.find(
            (item) => item.food.toString() === foodId
        );

        if (existingItem) {
            // Check stock for total quantity
            if (food.stock < existingItem.quantity + quantity) {
                const error = new Error(`Only ${food.stock} items left in stock`);
                error.statusCode = 400;
                throw error;
            }
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ food: foodId, quantity });
        }

        await cart.save();
        return this.getCart(userId);
    }

    /**
     * Remove item from cart
     * @param {String} userId
     * @param {String} itemId - Cart item _id
     * @returns {Object} - Updated cart
     */
    async removeItem(userId, itemId) {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            const error = new Error("Cart not found");
            error.statusCode = 404;
            throw error;
        }

        const itemIndex = cart.items.findIndex(
            (item) => item._id.toString() === itemId
        );

        if (itemIndex === -1) {
            const error = new Error("Item not found in cart");
            error.statusCode = 404;
            throw error;
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        return this.getCart(userId);
    }

    /**
     * Update item quantity in cart
     * @param {String} userId
     * @param {String} itemId - Cart item _id
     * @param {Number} quantity
     * @returns {Object} - Updated cart
     */
    async updateItemQuantity(userId, itemId, quantity) {
        if (quantity < 1) {
            const error = new Error("Quantity must be at least 1");
            error.statusCode = 400;
            throw error;
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            const error = new Error("Cart not found");
            error.statusCode = 404;
            throw error;
        }

        const item = cart.items.find(
            (item) => item._id.toString() === itemId
        );

        if (!item) {
            const error = new Error("Item not found in cart");
            error.statusCode = 404;
            throw error;
        }

        // Check stock
        const food = await Food.findById(item.food);
        if (food.stock < quantity) {
            const error = new Error(`Only ${food.stock} items left in stock`);
            error.statusCode = 400;
            throw error;
        }

        item.quantity = quantity;
        await cart.save();

        return this.getCart(userId);
    }

    /**
     * Clear all items in cart
     * @param {String} userId
     * @returns {Object} - Success message
     */
    async clearCart(userId) {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return { success: true, message: "Cart is already empty" };
        }

        cart.items = [];
        await cart.save();

        return {
            success: true,
            message: "Cart cleared successfully",
        };
    }
}

module.exports = new CartService();
