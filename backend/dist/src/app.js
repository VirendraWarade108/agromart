"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
// =======================
// Import routes
// =======================
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const orderTrackingRoutes_1 = __importDefault(require("./routes/orderTrackingRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const adminProductRoutes_1 = __importDefault(require("./routes/adminProductRoutes"));
const Wishlistroutes_1 = __importDefault(require("./routes/Wishlistroutes"));
const reviewroutes_1 = __importDefault(require("./routes/reviewroutes"));
const path_1 = __importDefault(require("path"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const adminUserRoutes_1 = __importDefault(require("./routes/adminUserRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes")); // ✅ ADDED
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes")); // ✅ ADDED
const adminAnalyticsRoutes_1 = __importDefault(require("./routes/adminAnalyticsRoutes")); // ✅ ADDED
/**
 * Create Express application
 */
const app = (0, express_1.default)();
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
/**
 * Connect to database
 */
(0, database_1.connectDatabase)();
app.use('/api/admin/users', adminUserRoutes_1.default);
app.use('/api/support', supportRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
// Security headers
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AgroMart API Server',
        timestamp: new Date().toISOString(),
    });
});
/**
 * Root endpoint - API information
 */
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AgroMart API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            products: '/api/products',
            categories: '/api/categories',
            cart: '/api/cart',
            checkout: '/api/checkout',
            orders: '/api/orders',
            // ✅ NEW
            addresses: '/api/users/addresses',
            coupons: '/api/coupons',
            payment: '/api/payment',
            adminProducts: '/api/admin/products',
            wishlist: '/api/wishlist',
            wishlistAlt: '/api/users/wishlist', // ✅ ADDED
            upload: '/api/upload',
            adminUsers: '/api/admin/users',
            support: '/api/support',
            tracking: '/api/orders/:orderId/tracking',
            reviews: '/api/reviews',
            users: '/api/users', // ✅ ADDED
            blog: '/api/blog', // ✅ ADDED
            adminAnalytics: '/api/admin/analytics', // ✅ ADDED
        },
    });
});
/**
 * =======================
 * API Routes
 * =======================
 */
// Auth
app.use('/api/auth', authRoutes_1.default);
// Storefront
app.use('/api/products', productRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
// Reviews (must be mounted before /api for /products/:productId/reviews to work)
app.use('/api', reviewroutes_1.default);
// Cart / Checkout / Orders
app.use('/api', orderRoutes_1.default);
// Order Tracking (must be mounted before generic /orders routes to avoid conflicts)
app.use('/api/orders', orderTrackingRoutes_1.default);
// User
app.use('/api/users/addresses', addressRoutes_1.default);
// Coupons
app.use('/api/coupons', couponRoutes_1.default);
// Payment
app.use('/api/payment', paymentRoutes_1.default); // ✅ UNCOMMENTED
// User Profile & Settings
app.use('/api/users', userRoutes_1.default); // ✅ ADDED
// Blog
app.use('/api/blog', blogRoutes_1.default); // ✅ ADDED
// Admin
app.use('/api/admin/products', adminProductRoutes_1.default);
app.use('/api/admin/analytics', adminAnalyticsRoutes_1.default); // ✅ ADDED
// ✅ WISHLIST - Mount at BOTH paths for compatibility
app.use('/api/wishlist', Wishlistroutes_1.default);
app.use('/api/users/wishlist', Wishlistroutes_1.default); // ✅ ADDED for frontend compatibility
/**
 * 404 handler
 */
app.use(errorHandler_1.notFoundHandler);
/**
 * Global error handler
 */
app.use(errorHandler_1.errorHandler);
exports.default = app;
