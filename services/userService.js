const User = require("../models/user");

/**
 * User Service
 * Handles user management business logic and database operations
 */
class UserService {
    /**
     * Get all users
     * @returns {Object} - List of all users
     */
    async getAllUsers() {
        // Get all users, exclude password field
        const users = await User.find().select("-password").sort({ createdAt: -1 });

        return {
            success: true,
            count: users.length,
            data: {
                users: users.map((user) => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                })),
            },
        };
    }

    /**
     * Delete user by ID
     * @param {String} userId - User ID to delete
     * @param {String} currentUserId - ID of user making the request
     * @returns {Object} - Success message
     */
    async deleteUser(userId, currentUserId) {
        // Validate user ID
        if (!userId) {
            const error = new Error("User ID is required");
            error.statusCode = 400;
            throw error;
        }

        // Prevent self-deletion
        if (userId === currentUserId) {
            const error = new Error("You cannot delete your own account");
            error.statusCode = 400;
            throw error;
        }

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Delete user
        await User.findByIdAndDelete(userId);

        return {
            success: true,
            message: `User ${user.name} has been deleted successfully`,
        };
    }

    /**
     * Get user by ID
     * @param {String} userId - User ID
     * @returns {Object} - User data
     */
    async getUserById(userId) {
        const user = await User.findById(userId).select("-password");

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return {
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        };
    }

    /**
     * Update user profile
     * User can only update their own profile
     * @param {String} userId - User ID from JWT token
     * @param {Object} updateData - Data to update
     * @returns {Object} - Updated user data
     */
    async updateProfile(userId, updateData) {
        const { name, phone, address, email } = updateData;

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                const error = new Error("Email is already in use");
                error.statusCode = 400;
                throw error;
            }
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                const error = new Error("Please provide a valid email address");
                error.statusCode = 400;
                throw error;
            }
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        // Save updated user
        await user.save();

        return {
            success: true,
            message: "Profile updated successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    updatedAt: user.updatedAt,
                },
            },
        };
    }
}

module.exports = new UserService();
