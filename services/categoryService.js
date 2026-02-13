const Category = require("../models/category");

/**
 * Category Service
 * Handles category management business logic and database operations
 */
class CategoryService {
    /**
     * Get all categories
     * @returns {Object} - List of all categories
     */
    async getAllCategories() {
        const categories = await Category.find().sort({ createdAt: -1 });

        return {
            success: true,
            count: categories.length,
            data: {
                categories: categories.map((category) => ({
                    id: category._id,
                    name: category.name,
                    description: category.description,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                })),
            },
        };
    }

    /**
     * Get category by ID
     * @param {String} categoryId - Category ID
     * @returns {Object} - Category data
     */
    async getCategoryById(categoryId) {
        const category = await Category.findById(categoryId);

        if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        return {
            success: true,
            data: {
                category: {
                    id: category._id,
                    name: category.name,
                    description: category.description,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                },
            },
        };
    }

    /**
     * Create new category
     * @param {Object} categoryData - Category data
     * @returns {Object} - Created category
     */
    async createCategory(categoryData) {
        const { name, description } = categoryData;

        // Validate required fields
        if (!name) {
            const error = new Error("Please provide category name");
            error.statusCode = 400;
            throw error;
        }

        // Check if category already exists
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            const error = new Error("Category with this name already exists");
            error.statusCode = 400;
            throw error;
        }

        // Create category
        const category = await Category.create({
            name,
            description,
        });

        return {
            success: true,
            message: "Category created successfully",
            data: {
                category: {
                    id: category._id,
                    name: category.name,
                    description: category.description,
                    createdAt: category.createdAt,
                },
            },
        };
    }

    /**
     * Update category
     * @param {String} categoryId - Category ID
     * @param {Object} updateData - Data to update
     * @returns {Object} - Updated category
     */
    async updateCategory(categoryId, updateData) {
        const { name, description } = updateData;

        // Find category
        const category = await Category.findById(categoryId);

        if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        // Check if new name already exists
        if (name && name !== category.name) {
            const nameExists = await Category.findOne({ name });
            if (nameExists) {
                const error = new Error("Category with this name already exists");
                error.statusCode = 400;
                throw error;
            }
        }

        // Update fields
        if (name) category.name = name;
        if (description !== undefined) category.description = description;

        await category.save();

        return {
            success: true,
            message: "Category updated successfully",
            data: {
                category: {
                    id: category._id,
                    name: category.name,
                    description: category.description,
                    updatedAt: category.updatedAt,
                },
            },
        };
    }

    /**
     * Delete category
     * @param {String} categoryId - Category ID
     * @returns {Object} - Success message
     */
    async deleteCategory(categoryId) {
        const category = await Category.findById(categoryId);

        if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        await Category.findByIdAndDelete(categoryId);

        return {
            success: true,
            message: `Category "${category.name}" has been deleted successfully`,
        };
    }
}

module.exports = new CategoryService();
