const Food = require("../models/food");
const Category = require("../models/category");

/**
 * Food Service
 * Handles food management business logic and database operations
 */
class FoodService {
    /**
     * Get all foods with optional filters
     * @param {Object} filters - Optional filters (category, isAvailable, search)
     * @returns {Object} - List of foods
     */
    async getAllFoods(filters = {}) {
        const { category, isAvailable, search } = filters;

        // Build query
        let query = {};

        if (category) {
            query.category = category;
        }

        if (isAvailable !== undefined) {
            query.isAvailable = isAvailable;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const foods = await Food.find(query)
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return {
            success: true,
            count: foods.length,
            data: {
                foods: foods.map((food) => ({
                    id: food._id,
                    name: food.name,
                    price: food.price,
                    image: food.image,
                    description: food.description,
                    category: food.category,
                    stock: food.stock,
                    isAvailable: food.isAvailable,
                    createdAt: food.createdAt,
                    updatedAt: food.updatedAt,
                })),
            },
        };
    }

    /**
     * Get food by ID
     * @param {String} foodId - Food ID
     * @returns {Object} - Food data
     */
    async getFoodById(foodId) {
        const food = await Food.findById(foodId).populate("category", "name description");

        if (!food) {
            const error = new Error("Food not found");
            error.statusCode = 404;
            throw error;
        }

        return {
            success: true,
            data: {
                food: {
                    id: food._id,
                    name: food.name,
                    price: food.price,
                    image: food.image,
                    description: food.description,
                    category: food.category,
                    stock: food.stock,
                    isAvailable: food.isAvailable,
                    createdAt: food.createdAt,
                    updatedAt: food.updatedAt,
                },
            },
        };
    }

    /**
     * Create new food
     * @param {Object} foodData - Food data
     * @returns {Object} - Created food
     */
    async createFood(foodData) {
        const { name, price, image, description, category, stock, isAvailable } = foodData;

        // Validate required fields
        if (!name || !price || !category) {
            const error = new Error("Please provide name, price and category");
            error.statusCode = 400;
            throw error;
        }

        // Validate price
        if (price < 0) {
            const error = new Error("Price cannot be negative");
            error.statusCode = 400;
            throw error;
        }

        // Check if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        // Create food
        const food = await Food.create({
            name,
            price,
            image,
            description,
            category,
            stock: stock || 0,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
        });

        // Populate category
        await food.populate("category", "name");

        return {
            success: true,
            message: "Food created successfully",
            data: {
                food: {
                    id: food._id,
                    name: food.name,
                    price: food.price,
                    image: food.image,
                    description: food.description,
                    category: food.category,
                    stock: food.stock,
                    isAvailable: food.isAvailable,
                    createdAt: food.createdAt,
                },
            },
        };
    }

    /**
     * Update food
     * @param {String} foodId - Food ID
     * @param {Object} updateData - Data to update
     * @returns {Object} - Updated food
     */
    async updateFood(foodId, updateData) {
        const { name, price, image, description, category, stock, isAvailable } = updateData;

        // Find food
        const food = await Food.findById(foodId);

        if (!food) {
            const error = new Error("Food not found");
            error.statusCode = 404;
            throw error;
        }

        // Validate price if provided
        if (price !== undefined && price < 0) {
            const error = new Error("Price cannot be negative");
            error.statusCode = 400;
            throw error;
        }

        // Validate stock if provided
        if (stock !== undefined && stock < 0) {
            const error = new Error("Stock cannot be negative");
            error.statusCode = 400;
            throw error;
        }

        // Check if category exists if changing
        if (category && category !== food.category.toString()) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                const error = new Error("Category not found");
                error.statusCode = 404;
                throw error;
            }
        }

        // Update fields
        if (name) food.name = name;
        if (price !== undefined) food.price = price;
        if (image !== undefined) food.image = image;
        if (description !== undefined) food.description = description;
        if (category) food.category = category;
        if (stock !== undefined) food.stock = stock;
        if (isAvailable !== undefined) food.isAvailable = isAvailable;

        await food.save();
        await food.populate("category", "name");

        return {
            success: true,
            message: "Food updated successfully",
            data: {
                food: {
                    id: food._id,
                    name: food.name,
                    price: food.price,
                    image: food.image,
                    description: food.description,
                    category: food.category,
                    stock: food.stock,
                    isAvailable: food.isAvailable,
                    updatedAt: food.updatedAt,
                },
            },
        };
    }

    /**
     * Delete food
     * @param {String} foodId - Food ID
     * @returns {Object} - Success message
     */
    async deleteFood(foodId) {
        const food = await Food.findById(foodId);

        if (!food) {
            const error = new Error("Food not found");
            error.statusCode = 404;
            throw error;
        }

        await Food.findByIdAndDelete(foodId);

        return {
            success: true,
            message: `Food "${food.name}" has been deleted successfully`,
        };
    }
}

module.exports = new FoodService();
