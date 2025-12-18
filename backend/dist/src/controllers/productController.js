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
exports.searchProducts = exports.getRelatedProducts = exports.getFeaturedProducts = exports.getProductsByCategory = exports.getProductById = exports.getAllProducts = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const productService = __importStar(require("../services/productService"));
/**
 * Get all products
 * GET /api/products
 */
exports.getAllProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, category, search, minPrice, maxPrice, sortBy, } = req.query;
    const result = await productService.getAllProducts({
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        category: category,
        search: search,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        sortBy: sortBy,
    });
    res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
    });
});
/**
 * Get single product by ID or slug
 * GET /api/products/:id
 */
exports.getProductById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json({
        success: true,
        data: product,
    });
});
/**
 * Get products by category
 * GET /api/products/category/:categoryId
 */
exports.getProductsByCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { categoryId } = req.params;
    const { page, limit } = req.query;
    const result = await productService.getProductsByCategory(categoryId, {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
    });
});
/**
 * Get featured products
 * GET /api/products/featured
 */
exports.getFeaturedProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { limit } = req.query;
    const products = await productService.getFeaturedProducts(limit ? parseInt(limit) : undefined);
    res.json({
        success: true,
        data: products,
    });
});
/**
 * Get related products
 * GET /api/products/:id/related
 */
exports.getRelatedProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { limit } = req.query;
    const products = await productService.getRelatedProducts(id, limit ? parseInt(limit) : undefined);
    res.json({
        success: true,
        data: products,
    });
});
/**
 * Search products
 * GET /api/products/search
 */
exports.searchProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { q, page, limit } = req.query;
    if (!q) {
        return res.status(400).json({
            success: false,
            message: 'Search query is required',
        });
    }
    const result = await productService.searchProducts(q, {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
    });
});
