import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';

/**
 * Create Express application
 */
const app: Express = express();

/**
 * Connect to database
 */
connectDatabase();

/**
 * Middleware
 */

// Security headers
app.use(helmet());

// CORS - Allow frontend to communicate with backend
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
    },
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', orderRoutes); // Cart, checkout, orders routes

/**
 * 404 handler - Catch undefined routes
 */
app.use(notFoundHandler);

/**
 * Global error handler
 */
app.use(errorHandler);

export default app;