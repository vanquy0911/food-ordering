const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Food Ordering API',
        version: '1.0.0',
        status: 'Server is running'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Import routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error handling middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
});
