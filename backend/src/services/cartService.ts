import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import * as couponService from './couponService';

/**
 * Get user's cart with all items
 */
export const getCart = async (userId: string) => {
  // Find or create cart for user
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              originalPrice: true,
              image: true,
              stock: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Create cart if doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                image: true,
                stock: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Transform response to match frontend expectations
  const transformedCart = {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        thumbnail: item.product.image, // Frontend expects 'thumbnail'
        inStock: (item.product.stock || 0) > 0, // Frontend expects 'inStock' boolean
        category: item.product.category?.name || 'Uncategorized', // Frontend expects category string
      },
      price: item.product.price, // Add price at item level for frontend
    })),
  };

  return transformedCart;
};

/**
 * Add product to cart
 */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number = 1
) => {
  // Validate quantity
  if (quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  // Check if product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!product.stock || product.stock < quantity) {
    throw new AppError('Product out of stock', 400);
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Check if product already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;

    if (product.stock < newQuantity) {
      throw new AppError('Not enough stock available', 400);
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  // Return updated cart
  return getCart(userId);
};

/**
 * Update cart item quantity by cart item ID
 */
export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  // Validate quantity
  if (quantity < 0) {
    throw new AppError('Quantity cannot be negative', 400);
  }

  // If quantity is 0, remove item
  if (quantity === 0) {
    return removeFromCart(userId, cartItemId);
  }

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Find cart item by ID
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });

  if (!cartItem || cartItem.cartId !== cart.id) {
    throw new AppError('Item not in cart', 404);
  }

  // Check stock
  if (!cartItem.product.stock || cartItem.product.stock < quantity) {
    throw new AppError('Not enough stock available', 400);
  }

  // Update quantity
  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });

  // Return updated cart
  return getCart(userId);
};

/**
 * Remove item from cart by cart item ID
 */
export const removeFromCart = async (userId: string, cartItemId: string) => {
  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Verify item belongs to user's cart
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem || cartItem.cartId !== cart.id) {
    throw new AppError('Item not in cart', 404);
  }

  // Delete item
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  // Return updated cart
  return getCart(userId);
};

/**
 * Clear entire cart
 */
export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Delete all items
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return getCart(userId);
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (cart: any, discountAmount: number = 0) => {
  let subtotal = 0;

  cart.items.forEach((item: any) => {
    subtotal += item.product.price * item.quantity;
  });

  const total = Math.max(0, subtotal - discountAmount);

  return {
    subtotal,
    discount: discountAmount,
    total,
  };
};

/**
 * Apply coupon to cart (NEW)
 */
export const applyCouponToCart = async (userId: string, couponCode: string) => {
  // Get cart
  const cart = await getCart(userId);

  if (!cart.items || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Calculate subtotal
  const totals = calculateCartTotals(cart, 0);

  // Validate coupon
  const result = await couponService.validateCoupon(couponCode, totals.subtotal);

  return {
    cart,
    coupon: result.coupon,
    discountAmount: result.discountAmount,
    totals: calculateCartTotals(cart, result.discountAmount),
  };
};

/**
 * Remove coupon from cart (NEW)
 */
export const removeCouponFromCart = async (userId: string) => {
  const cart = await getCart(userId);
  const totals = calculateCartTotals(cart, 0);

  return {
    cart,
    coupon: null,
    discountAmount: 0,
    totals,
  };
};

/**
 * Sync cart with server (merge local and server carts)
 * POST /api/cart/sync
 */
export const syncCart = async (userId: string, localItems: any[]) => {
  // Get or create server cart
  const serverCart = await getCart(userId);

  // Merge logic: for each local item, add/update in server cart
  for (const localItem of localItems) {
    try {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: localItem.productId },
      });

      if (!product || !product.stock || product.stock < 1) {
        // Skip items that are no longer available
        continue;
      }

      // Find existing cart item
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: serverCart.id,
            productId: localItem.productId,
          },
        },
      });

      if (existingItem) {
        // Update to higher quantity (local or server)
        const newQuantity = Math.max(existingItem.quantity, localItem.quantity);
        const cappedQuantity = Math.min(newQuantity, product.stock, 50);

        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: cappedQuantity },
        });
      } else {
        // Add new item from local cart
        const cappedQuantity = Math.min(localItem.quantity, product.stock, 50);

        await prisma.cartItem.create({
          data: {
            cartId: serverCart.id,
            productId: localItem.productId,
            quantity: cappedQuantity,
          },
        });
      }
    } catch (error) {
      console.error(`Failed to sync item ${localItem.productId}:`, error);
      // Continue with other items
    }
  }

  // Return merged cart
  return getCart(userId);
};