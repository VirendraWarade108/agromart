import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as invoiceService from '../services/invoiceService';

/**
 * Get order invoice
 * GET /api/orders/:id/invoice
 */
export const getOrderInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const invoice = await invoiceService.getInvoiceJSON(id, userId);

    res.json({
      success: true,
      data: invoice,
    });
  }
);

/**
 * Get order invoice as PDF (future implementation)
 * GET /api/orders/:id/invoice/pdf
 */
export const getOrderInvoicePDF = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const invoice = await invoiceService.getInvoicePDF(id, userId);

    res.json({
      success: true,
      data: invoice,
    });
  }
);