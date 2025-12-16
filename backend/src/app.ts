import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// =======================
// Import routes
// =======================
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import addressRoutes from './routes/addressRoutes';
import couponRoutes from './routes/couponRoutes';
//import paymentRoutes from './routes/paymentRoutes';
import adminProductRoutes from './routes/adminProductRoutes';
import wishlistRoutes from './routes/Wishlistroutes';
import path from 'path';
import uploadRoutes from './routes/uploadRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import supportRoutes from './routes/supportRoutes';

/**
 * Create Express application
 */
const app: Express = express();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
/**
 * Connect to database
 */
connectDatabase();
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/upload', uploadRoutes);
// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'AgroMart API Server',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Root endpoint - API information
 */
app.get('/api', (req: Request, res: Response) => {
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
      upload: '/api/upload',
      adminUsers: '/api/admin/users',
      support: '/api/support',
    },
  });
});

/**
 * =======================
 * API Routes
 * =======================
 */

// Auth
app.use('/api/auth', authRoutes);

// Storefront
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Cart / Checkout / Orders
app.use('/api', orderRoutes);

// User
app.use('/api/users/addresses', addressRoutes);

// Coupons
app.use('/api/coupons', couponRoutes);

// Payment
//app.use('/api/payment', paymentRoutes);

// Admin
app.use('/api/admin/products', adminProductRoutes);

//whishlist
app.use('/api/wishlist', wishlistRoutes);

/**
 * 404 handler
 */
app.use(notFoundHandler);

/**
 * Global error handler
 */
app.use(errorHandler);

export default app;
