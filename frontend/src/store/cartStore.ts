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

  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;

  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getShipping: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;

  syncWithServer: () => Promise<void>;
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
        const existing = get().items.find((i) => i.productId === item.productId);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...item, quantity: item.quantity || 1 }
            ]
          });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) return get().removeItem(productId);
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], couponCode: null, discount: 0 }),

      applyCoupon: (code) => {
        const subtotal = get().getSubtotal();
        const coupons: { [key: string]: number } = {
          SAVE10: 0.1,
          SAVE20: 0.2,
          WELCOME: 0.15,
        };

        const discount =
          coupons[code.toUpperCase()]
            ? subtotal * coupons[code.toUpperCase()]
            : code.toUpperCase() === "FLAT500"
            ? 500
            : 0;

        set({ couponCode: code, discount });
      },

      removeCoupon: () => set({ couponCode: null, discount: 0 }),

      getItemCount: () =>
        get().items.reduce((t, i) => t + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((t, i) => t + i.price * i.quantity, 0),

      getShipping: () =>
        get().getSubtotal() >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST,

      getTotal: () =>
        get().getSubtotal() + get().getShipping() - get().discount,

      isInCart: (productId) =>
        get().items.some((i) => i.productId === productId),

      getItemQuantity: (productId) =>
        get().items.find((i) => i.productId === productId)?.quantity || 0,

      syncWithServer: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: get().items }),
          });

          console.log("Cart synced with backend");

        } catch (err) {
          console.error("Cart sync failed", err);
        }
      },
    }),
    {
      name: 'agromart-cart-storage',
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discount: state.discount,
      }),
    }
  )
);

export default useCartStore;
