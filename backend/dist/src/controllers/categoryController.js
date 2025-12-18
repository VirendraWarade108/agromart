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
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryProducts = exports.getCategoryById = exports.getAllCategories = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const categoryService = __importStar(require("../services/categoryService"));
/**
 * Get all categories
 * GET /api/categories
 */
exports.getAllCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json({
        success: true,
        data: categories,
    });
});
/**
 * Get single category by ID
 * GET /api/categories/:id
 */
exports.getCategoryById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.json({
        success: true,
        data: category,
    });
});
/**
 * Get category products
 * GET /api/categories/:id/products
 */
exports.getCategoryProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { page, limit } = req.query;
    const result = await categoryService.getCategoryProducts(id, {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({
        success: true,
        data: result.products,
        category: result.category,
        pagination: result.pagination,
    });
});
/**
 * Create new category (Admin only)
 * POST /api/admin/categories
 */
exports.createCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, icon } = req.body;
    const category = await categoryService.createCategory({
        name,
        description,
        icon,
    });
    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
    });
});
/**
 * Update category (Admin only)
 * PUT /api/admin/categories/:id
 */
exports.updateCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, description, icon } = req.body;
    const category = await categoryService.updateCategory(id, {
        name,
        description,
        icon,
    });
    res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
    });
});
/**
 * Delete category (Admin only)
 * DELETE /api/admin/categories/:id
 */
exports.deleteCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const category = await categoryService.deleteCategory(id);
    res.json({
        success: true,
        message: 'Category deleted successfully',
        data: category,
    });
});
