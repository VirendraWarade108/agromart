import { Router } from 'express';
import * as productController from '../controllers/productController';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// Get featured products (must be before /:id to avoid conflict)
router.get('/featured', productController.getFeaturedProducts);

// Search products (must be before /:id to avoid conflict)
router.get('/search', productController.searchProducts);

// Get all products with filters
router.get('/', productController.getAllProducts);

// Get single product by ID or slug
router.get('/:id', productController.getProductById);

// Get related products
router.get('/:id/related', productController.getRelatedProducts);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

export default router;