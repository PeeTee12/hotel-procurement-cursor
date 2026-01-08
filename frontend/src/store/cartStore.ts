import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productOfferId: number
  quantity: number
  unitPrice: string
  totalPrice: string
  currency: string
  product: {
    id: number
    name: string
    unit: string
    image?: string | null
  }
  supplier: {
    id: number
    name: string
  }
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQuantity: (productOfferId: number, quantity: number) => void
  removeItem: (productOfferId: number) => void
  clearCart: () => void
  getTotal: () => string
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productOfferId === newItem.productOfferId
          )
          
          if (existingIndex >= 0) {
            const items = [...state.items]
            const existing = items[existingIndex]
            const newQuantity = existing.quantity + newItem.quantity
            items[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              totalPrice: (parseFloat(existing.unitPrice) * newQuantity).toFixed(2),
            }
            return { items }
          }
          
          return { items: [...state.items, newItem] }
        })
      },
      updateQuantity: (productOfferId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productOfferId === productOfferId
              ? {
                  ...item,
                  quantity,
                  totalPrice: (parseFloat(item.unitPrice) * quantity).toFixed(2),
                }
              : item
          ),
        }))
      },
      removeItem: (productOfferId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productOfferId !== productOfferId),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items
        return items
          .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
          .toFixed(2)
      },
      getItemCount: () => get().items.length,
    }),
    {
      name: 'procurex-cart',
    }
  )
)
