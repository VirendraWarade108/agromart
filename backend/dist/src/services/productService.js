"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.getRelatedProducts = exports.getFeaturedProducts = exports.getProductsByCategory = exports.getProductById = exports.getAllProducts = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get all products with filters and pagination
 */
const getAllProducts = async (filters) => {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, sortBy = 'createdAt', } = filters;
    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;
    // Build where clause
    const where = {};
    // Category filter
    if (category) {
        where.categoryId = category;
    }
    // Search filter (searches in name and description)
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined)
            where.price.gte = minPrice;
        if (maxPrice !== undefined)
            where.price.lte = maxPrice;
    }
    // Build orderBy clause
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc')
        orderBy = { price: 'asc' };
    if (sortBy === 'price-desc')
        orderBy = { price: 'desc' };
    if (sortBy === 'name')
        orderBy = { name: 'asc' };
    if (sortBy === 'rating')
        orderBy = { rating: 'desc' };
    // Get products and total count
    const [products, total] = await Promise.all([
        database_1.default.product.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    },
                },
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                    },
                },
            },
        }),
        database_1.default.product.count({ where }),
    ]);
    return {
        products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllProducts = getAllProducts;
/**
 * Get single product by ID or slug
 */
const getProductById = async (idOrSlug) => {
    const product = await database_1.default.product.findFirst({
        where: {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    icon: true,
                },
            },
            vendor: {
                select: {
                    id: true,
                    businessName: true,
                    email: true,
                    phone: true,
                    website: true,
                    logo: true,
                    city: true,
                    state: true,
                },
            },
        },
    });
    if (!product) {
        throw new errorHandler_1.AppError('Product not found', 404);
    }
    return product;
};
exports.getProductById = getProductById;
/**
 * Get products by category
 */
const getProductsByCategory = async (categoryId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        database_1.default.product.findMany({
            where: { categoryId },
            skip,
            take: limit,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.product.count({ where: { categoryId } }),
    ]);
    return {
        products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getProductsByCategory = getProductsByCategory;
/**
 * Get featured products (highest rated or newest)
 */
const getFeaturedProducts = async (limit = 8) => {
    const products = await database_1.default.product.findMany({
        take: limit,
        where: {
            stock: { gt: 0 }, // Only in-stock products
        },
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    icon: true,
                },
            },
        },
    });
    return products;
};
exports.getFeaturedProducts = getFeaturedProducts;
/**
 * Get related products (same category, excluding current product)
 */
const getRelatedProducts = async (productId, limit = 4) => {
    // First get the product to find its category
    const product = await database_1.default.product.findUnique({
        where: { id: productId },
        select: { categoryId: true },
    });
    if (!product || !product.categoryId) {
        return [];
    }
    // Get products from same category
    const relatedProducts = await database_1.default.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: productId }, // Exclude current product
            stock: { gt: 0 },
        },
        take: limit,
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    icon: true,
                },
            },
        },
        orderBy: { rating: 'desc' },
    });
    return relatedProducts;
};
exports.getRelatedProducts = getRelatedProducts;
/**
 * Search products
 */
const searchProducts = async (query, options = {}) => {
    return (0, exports.getAllProducts)({
        ...options,
        search: query,
    });
};
exports.searchProducts = searchProducts;
