"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateProduct = exports.getProductStats = exports.getOutOfStockProducts = exports.getLowStockProducts = exports.bulkUpdateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const adminProductService = __importStar(require("../services/adminProductService"));
// ============================================
// ADMIN PRODUCT CRUD
// ============================================
/**
 * Create new product
 * POST /api/admin/products
 */
exports.createProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, slug, description, price, originalPrice, stock, images, categoryId, vendorId, } = req.body;
    // Validate required fields
    if (!name || !price || stock === undefined || !images || !categoryId) {
        return res.status(400).json({
            success: false,
            message: 'Name, price, stock, images, and categoryId are required',
        });
    }
    const product = await adminProductService.createProduct({
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        stock: parseInt(stock),
        images,
        categoryId,
        vendorId,
    });
    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
    });
});
/**
 * Update product
 * PUT /api/admin/products/:id
 */
exports.updateProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    // Parse numeric fields if present
    if (updateData.price)
        updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice)
        updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.stock)
        updateData.stock = parseInt(updateData.stock);
    const product = await adminProductService.updateProduct(id, updateData);
    res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
    });
});
/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
exports.deleteProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await adminProductService.deleteProduct(id);
    res.json({
        success: true,
        message: result.message,
    });
});
/**
 * Bulk update stock
 * PUT /api/admin/products/stock/bulk
 */
exports.bulkUpdateStock = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            success: false,
            message: 'Updates array is required',
        });
    }
    const result = await adminProductService.bulkUpdateStock(updates);
    res.json({
        success: true,
        message: `Bulk update completed. ${result.succeeded} succeeded, ${result.failed} failed.`,
        data: result,
    });
});
/**
 * Get low stock products
 * GET /api/admin/products/stock/low
 */
exports.getLowStockProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const threshold = req.query.threshold
        ? parseInt(req.query.threshold)
        : 10;
    const products = await adminProductService.getLowStockProducts(threshold);
    res.json({
        success: true,
        count: products.length,
        data: products,
    });
});
/**
 * Get out of stock products
 * GET /api/admin/products/stock/out
 */
exports.getOutOfStockProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const products = await adminProductService.getOutOfStockProducts();
    res.json({
        success: true,
        count: products.length,
        data: products,
    });
});
/**
 * Get product statistics
 * GET /api/admin/products/stats
 */
exports.getProductStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stats = await adminProductService.getProductStats();
    res.json({
        success: true,
        data: stats,
    });
});
/**
 * Duplicate product
 * POST /api/admin/products/:id/duplicate
 */
exports.duplicateProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const product = await adminProductService.duplicateProduct(id);
    res.status(201).json({
        success: true,
        message: 'Product duplicated successfully',
        data: product,
    });
});
