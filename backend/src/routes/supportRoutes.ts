import { Router } from 'express';
import * as supportController from '../controllers/supportController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

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
router.get(
  '/admin/messages',
  authenticate,
  requireAdmin,
  supportController.getAllContactMessages
);

/**
 * Update message status
 * PUT /api/admin/support/messages/:id
 */
router.put(
  '/admin/messages/:id',
  authenticate,
  requireAdmin,
  supportController.updateMessageStatus
);

/**
 * Delete contact message
 * DELETE /api/admin/support/messages/:id
 */
router.delete(
  '/admin/messages/:id',
  authenticate,
  requireAdmin,
  supportController.deleteContactMessage
);

/**
 * Get newsletter stats
 * GET /api/admin/support/newsletter/stats
 */
router.get(
  '/admin/newsletter/stats',
  authenticate,
  requireAdmin,
  supportController.getNewsletterStats
);

/**
 * Get all subscribers
 * GET /api/admin/support/newsletter
 */
router.get(
  '/admin/newsletter',
  authenticate,
  requireAdmin,
  supportController.getAllSubscribers
);

/**
 * Create FAQ
 * POST /api/admin/support/faqs
 */
router.post(
  '/admin/faqs',
  authenticate,
  requireAdmin,
  supportController.createFAQ
);

/**
 * Update FAQ
 * PUT /api/admin/support/faqs/:id
 */
router.put(
  '/admin/faqs/:id',
  authenticate,
  requireAdmin,
  supportController.updateFAQ
);

/**
 * Delete FAQ
 * DELETE /api/admin/support/faqs/:id
 */
router.delete(
  '/admin/faqs/:id',
  authenticate,
  requireAdmin,
  supportController.deleteFAQ
);

export default router;