"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryProducts = exports.getCategoryById = exports.getAllCategories = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get all categories
 */
const getAllCategories = async () => {
    const categories = await database_1.default.category.findMany({
        include: {
            _count: {
                select: { products: true }, // Count products in each category
            },
        },
        orderBy: { name: 'asc' },
    });
    return categories;
};
exports.getAllCategories = getAllCategories;
/**
 * Get single category by ID
 */
const getCategoryById = async (id) => {
    const category = await database_1.default.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
    if (!category) {
        throw new errorHandler_1.AppError('Category not found', 404);
    }
    return category;
};
exports.getCategoryById = getCategoryById;
/**
 * Get category products
 */
const getCategoryProducts = async (categoryId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    // Check if category exists
    const category = await database_1.default.category.findUnique({
        where: { id: categoryId },
    });
    if (!category) {
        throw new errorHandler_1.AppError('Category not found', 404);
    }
    // Get products
    const [products, total] = await Promise.all([
        database_1.default.product.findMany({
            where: { categoryId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.product.count({ where: { categoryId } }),
    ]);
    return {
        category,
        products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getCategoryProducts = getCategoryProducts;
/**
 * Create new category (Admin only)
 */
const createCategory = async (data) => {
    // Check if category with same name exists
    const existing = await database_1.default.category.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' } },
    });
    if (existing) {
        throw new errorHandler_1.AppError('Category with this name already exists', 400);
    }
    const category = await database_1.default.category.create({
        data,
    });
    return category;
};
exports.createCategory = createCategory;
/**
 * Update category (Admin only)
 */
const updateCategory = async (id, data) => {
    // Check if category exists
    const existing = await database_1.default.category.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new errorHandler_1.AppError('Category not found', 404);
    }
    // If updating name, check for duplicates
    if (data.name && data.name !== existing.name) {
        const duplicate = await database_1.default.category.findFirst({
            where: {
                name: { equals: data.name, mode: 'insensitive' },
                id: { not: id },
            },
        });
        if (duplicate) {
            throw new errorHandler_1.AppError('Category with this name already exists', 400);
        }
    }
    const category = await database_1.default.category.update({
        where: { id },
        data,
    });
    return category;
};
exports.updateCategory = updateCategory;
/**
 * Delete category (Admin only)
 */
const deleteCategory = async (id) => {
    // Check if category exists
    const category = await database_1.default.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
    if (!category) {
        throw new errorHandler_1.AppError('Category not found', 404);
    }
    // Check if category has products
    if (category._count.products > 0) {
        throw new errorHandler_1.AppError('Cannot delete category with products. Remove products first.', 400);
    }
    await database_1.default.category.delete({
        where: { id },
    });
    return category;
};
exports.deleteCategory = deleteCategory;
