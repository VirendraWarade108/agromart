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
const express_1 = require("express");
const adminProductController = __importStar(require("../controllers/adminProductController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.requireAdmin);
// ============================================
// PRODUCT CRUD
// ============================================
/**
 * Create new product
 * POST /api/admin/products
 */
router.post('/', adminProductController.createProduct);
/**
 * Update product
 * PUT /api/admin/products/:id
 */
router.put('/:id', adminProductController.updateProduct);
/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
router.delete('/:id', adminProductController.deleteProduct);
/**
 * Duplicate product
 * POST /api/admin/products/:id/duplicate
 */
router.post('/:id/duplicate', adminProductController.duplicateProduct);
// ============================================
// STOCK MANAGEMENT
// ============================================
/**
 * Bulk update stock
 * PUT /api/admin/products/stock/bulk
 */
router.put('/stock/bulk', adminProductController.bulkUpdateStock);
/**
 * Get low stock products
 * GET /api/admin/products/stock/low
 */
router.get('/stock/low', adminProductController.getLowStockProducts);
/**
 * Get out of stock products
 * GET /api/admin/products/stock/out
 */
router.get('/stock/out', adminProductController.getOutOfStockProducts);
// ============================================
// STATISTICS
// ============================================
/**
 * Get product statistics
 * GET /api/admin/products/stats
 */
router.get('/stats', adminProductController.getProductStats);
exports.default = router;
