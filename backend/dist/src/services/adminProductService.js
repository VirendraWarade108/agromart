"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateProduct = exports.getProductStats = exports.getOutOfStockProducts = exports.getLowStockProducts = exports.bulkUpdateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const slugify_1 = __importDefault(require("slugify"));
/**
 * Create new product (Admin)
 * Fixed to match actual Prisma schema fields
 */
const createProduct = async (productData) => {
    // Generate slug if not provided
    const slug = productData.slug || (0, slugify_1.default)(productData.name, { lower: true, strict: true });
    // Check if slug already exists
    const existingProduct = await database_1.default.product.findUnique({
        where: { slug },
    });
    if (existingProduct) {
        throw new errorHandler_1.AppError('Product with this slug already exists', 400);
    }
    // Verify category exists
    const category = await database_1.default.category.findUnique({
        where: { id: productData.categoryId },
    });
    if (!category) {
        throw new errorHandler_1.AppError('Category not found', 404);
    }
    // Create product
    const product = await database_1.default.product.create({
        data: {
            name: productData.name,
            slug,
            description: productData.description,
            price: productData.price,
            originalPrice: productData.originalPrice,
            stock: productData.stock,
            images: productData.images, // Type assertion for JsonValue
            categoryId: productData.categoryId,
            vendorId: productData.vendorId,
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            vendor: true,
        },
    });
    return product;
};
exports.createProduct = createProduct;
/**
 * Update product (Admin)
 */
const updateProduct = async (id, updateData) => {
    // Check if product exists
    const existingProduct = await database_1.default.product.findUnique({
        where: { id },
    });
    if (!existingProduct) {
        throw new errorHandler_1.AppError('Product not found', 404);
    }
    // If slug is being updated, check for conflicts
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
        const slugConflict = await database_1.default.product.findUnique({
            where: { slug: updateData.slug },
        });
        if (slugConflict) {
            throw new errorHandler_1.AppError('Product with this slug already exists', 400);
        }
    }
    // If name is being updated but slug is not, generate new slug
    if (updateData.name && !updateData.slug) {
        updateData.slug = (0, slugify_1.default)(updateData.name, { lower: true, strict: true });
    }
    // If category is being updated, verify it exists
    if (updateData.categoryId) {
        const category = await database_1.default.category.findUnique({
            where: { id: updateData.categoryId },
        });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
    }
    // Type assertion for images if present
    const dataToUpdate = { ...updateData };
    if (updateData.images) {
        dataToUpdate.images = updateData.images;
    }
    // Update product
    const updatedProduct = await database_1.default.product.update({
        where: { id },
        data: dataToUpdate,
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            vendor: true,
        },
    });
    return updatedProduct;
};
exports.updateProduct = updateProduct;
/**
 * Delete product (Admin)
 */
const deleteProduct = async (id) => {
    // Check if product exists
    const product = await database_1.default.product.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    cartItems: true,
                    orderItems: true,
                },
            },
        },
    });
    if (!product) {
        throw new errorHandler_1.AppError('Product not found', 404);
    }
    // Check if product is in any active carts or orders
    if (product._count.cartItems > 0) {
        throw new errorHandler_1.AppError('Cannot delete product. It exists in active carts.', 400);
    }
    if (product._count.orderItems > 0) {
        throw new errorHandler_1.AppError('Cannot delete product. It has associated orders. Consider marking it out of stock instead.', 400);
    }
    // Delete product
    await database_1.default.product.delete({
        where: { id },
    });
    return { message: 'Product deleted successfully' };
};
exports.deleteProduct = deleteProduct;
/**
 * Bulk update stock (Admin)
 */
const bulkUpdateStock = async (updates) => {
    const results = await Promise.all(updates.map(async (update) => {
        try {
            const product = await database_1.default.product.update({
                where: { id: update.id },
                data: { stock: update.stock },
                select: {
                    id: true,
                    name: true,
                    stock: true,
                },
            });
            return { success: true, product };
        }
        catch (error) {
            return {
                success: false,
                id: update.id,
                error: 'Product not found or update failed',
            };
        }
    }));
    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    return {
        total: updates.length,
        succeeded: succeeded.length,
        failed: failed.length,
        results,
    };
};
exports.bulkUpdateStock = bulkUpdateStock;
/**
 * Get low stock products (Admin)
 */
const getLowStockProducts = async (threshold = 10) => {
    const products = await database_1.default.product.findMany({
        where: {
            stock: {
                lte: threshold,
                gt: 0,
            },
        },
        select: {
            id: true,
            name: true,
            slug: true,
            stock: true,
            price: true,
            images: true,
            category: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: { stock: 'asc' },
    });
    return products;
};
exports.getLowStockProducts = getLowStockProducts;
/**
 * Get out of stock products (Admin)
 */
const getOutOfStockProducts = async () => {
    const products = await database_1.default.product.findMany({
        where: {
            stock: 0,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            category: {
                select: {
                    name: true,
                },
            },
            updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
    });
    return products;
};
exports.getOutOfStockProducts = getOutOfStockProducts;
/**
 * Get product statistics (Admin)
 */
const getProductStats = async () => {
    const [totalProducts, lowStock, outOfStock] = await Promise.all([
        database_1.default.product.count(),
        database_1.default.product.count({ where: { stock: { lte: 10, gt: 0 } } }),
        database_1.default.product.count({ where: { stock: 0 } }),
    ]);
    return {
        totalProducts,
        lowStock,
        outOfStock,
        inStock: totalProducts - outOfStock,
    };
};
exports.getProductStats = getProductStats;
/**
 * Duplicate product (Admin)
 */
const duplicateProduct = async (id) => {
    const originalProduct = await database_1.default.product.findUnique({
        where: { id },
    });
    if (!originalProduct) {
        throw new errorHandler_1.AppError('Product not found', 404);
    }
    // Create new slug
    const baseSlug = originalProduct.slug;
    let newSlug = `${baseSlug}-copy`;
    let counter = 1;
    // Ensure unique slug
    while (await database_1.default.product.findUnique({ where: { slug: newSlug } })) {
        newSlug = `${baseSlug}-copy-${counter}`;
        counter++;
    }
    // Create duplicate
    const duplicatedProduct = await database_1.default.product.create({
        data: {
            name: `${originalProduct.name} (Copy)`,
            slug: newSlug,
            description: originalProduct.description,
            price: originalProduct.price,
            originalPrice: originalProduct.originalPrice,
            stock: 0, // Start with 0 stock
            images: originalProduct.images, // Type assertion for JsonValue
            categoryId: originalProduct.categoryId,
            vendorId: originalProduct.vendorId,
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            vendor: true,
        },
    });
    return duplicatedProduct;
};
exports.duplicateProduct = duplicateProduct;
