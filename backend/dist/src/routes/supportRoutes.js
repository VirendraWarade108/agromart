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
const supportController = __importStar(require("../controllers/supportController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================
/**
 * Submit contact message
 * POST /api/support/contact
 */
router.post('/contact', supportController.submitContactMessage);
/**
 * Subscribe to newsletter (alias for frontend compatibility)
 * POST /api/support/newsletter
 */
router.post('/newsletter', supportController.subscribeToNewsletter);
/**
 * Subscribe to newsletter
 * POST /api/support/newsletter/subscribe
 */
router.post('/newsletter/subscribe', supportController.subscribeToNewsletter);
/**
 * Unsubscribe from newsletter
 * POST /api/support/newsletter/unsubscribe
 */
router.post('/newsletter/unsubscribe', supportController.unsubscribeFromNewsletter);
/**
 * Get FAQ categories
 * GET /api/support/faqs/categories
 */
router.get('/faqs/categories', supportController.getFAQCategories);
/**
 * Get all FAQs
 * GET /api/support/faqs
 */
router.get('/faqs', supportController.getAllFAQs);
/**
 * Get FAQ by ID
 * GET /api/support/faqs/:id
 */
router.get('/faqs/:id', supportController.getFAQById);
// ============================================
// ADMIN ROUTES
// ============================================
/**
 * Get all contact messages
 * GET /api/admin/support/messages
 */
router.get('/admin/messages', auth_1.authenticate, auth_1.requireAdmin, supportController.getAllContactMessages);
/**
 * Update message status
 * PUT /api/admin/support/messages/:id
 */
router.put('/admin/messages/:id', auth_1.authenticate, auth_1.requireAdmin, supportController.updateMessageStatus);
/**
 * Delete contact message
 * DELETE /api/admin/support/messages/:id
 */
router.delete('/admin/messages/:id', auth_1.authenticate, auth_1.requireAdmin, supportController.deleteContactMessage);
/**
 * Get newsletter stats
 * GET /api/admin/support/newsletter/stats
 */
router.get('/admin/newsletter/stats', auth_1.authenticate, auth_1.requireAdmin, supportController.getNewsletterStats);
/**
 * Get all subscribers
 * GET /api/admin/support/newsletter
 */
router.get('/admin/newsletter', auth_1.authenticate, auth_1.requireAdmin, supportController.getAllSubscribers);
/**
 * Create FAQ
 * POST /api/admin/support/faqs
 */
router.post('/admin/faqs', auth_1.authenticate, auth_1.requireAdmin, supportController.createFAQ);
/**
 * Update FAQ
 * PUT /api/admin/support/faqs/:id
 */
router.put('/admin/faqs/:id', auth_1.authenticate, auth_1.requireAdmin, supportController.updateFAQ);
/**
 * Delete FAQ
 * DELETE /api/admin/support/faqs/:id
 */
router.delete('/admin/faqs/:id', auth_1.authenticate, auth_1.requireAdmin, supportController.deleteFAQ);
exports.default = router;
