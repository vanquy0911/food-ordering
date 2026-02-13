const User = require("../models/user");

/**
 * Auth Service
 * Handles all authentication business logic, validation, and database operations
 */
class AuthService {
    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Object} - Token and user data
     */
    async register(userData) {
        const { name, email, password, phone, address } = userData;

        // Validate required fields
        if (!name || !email || !password) {
            const error = new Error("Please provide name, email and password");
            error.statusCode = 400;
            throw error;
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            const error = new Error("Please provide a valid email address");
            error.statusCode = 400;
            throw error;
        }

        // Validate password length
        if (password.length < 6) {
            const error = new Error("Password must be at least 6 characters");
            error.statusCode = 400;
            throw error;
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error("User already exists with this email");
            error.statusCode = 400;
            throw error;
        }

        // Create user (password will be hashed automatically by pre-save hook)
        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
        });

        // Generate JWT token
        const token = user.generateToken();

        // Return response data
        return {
            success: true,
            message: "User registered successfully",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    createdAt: user.createdAt,
                },
            },
        };
    }

    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @returns {Object} - Token and user data
     */
    async login(credentials) {
        const { email, password } = credentials;

        // Validate required fields
        if (!email || !password) {
            const error = new Error("Please provide email and password");
            error.statusCode = 400;
            throw error;
        }

        // Find user by email and include password field
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
        }

        // Compare password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token
        const token = user.generateToken();

        // Return response data
        return {
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                },
            },
        };
    }

    /**
     * Get current user by ID
     * @param {String} userId - User ID from JWT token
     * @returns {Object} - User data
     */
    async getCurrentUser(userId) {
        const user = await User.findById(userId);

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
     * Logout user
     * Note: With JWT, logout is handled client-side by removing the token
     * This endpoint just confirms the logout action
     * @returns {Object} - Success message
     */
    async logout() {
        return {
            success: true,
            message: "Logged out successfully",
        };
    }
}

module.exports = new AuthService();
