import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  inStock: boolean;
  category?: string;
}

export interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getShipping: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 200;

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          // Update quantity if item exists
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                ...item,
                quantity: item.quantity || 1,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          discount: 0,
        });
      },

      applyCoupon: (code) => {
        const subtotal = get().getSubtotal();
        let discount = 0;

        // Simple coupon logic (can be replaced with API call)
        switch (code.toUpperCase()) {
          case 'SAVE10':
            discount = subtotal * 0.1;
            break;
          case 'SAVE20':
            discount = subtotal * 0.2;
            break;
          case 'FLAT500':
            discount = 500;
            break;
          case 'WELCOME':
            discount = subtotal * 0.15;
            break;
          default:
            discount = 0;
        }

        set({
          couponCode: code,
          discount,
        });
      },

      removeCoupon: () => {
        set({
          couponCode: null,
          discount: 0,
        });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShipping();
        const discount = get().discount;
        return subtotal + shipping - discount;
      },

      isInCart: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'agromart-cart-storage',
      // Only persist items, couponCode, and discount
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discount: state.discount,
      }),
    }
  )
);

export default useCartStore;