import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchCart: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        set({ loading: true });
        try {
          const response = await apiClient.get('/api/cart');
          set({ items: response.data, loading: false });
        } catch (error) {
          console.error('Error fetching cart:', error);
          set({ loading: false });
        }
      },

      addToCart: async (book) => {
        try {
          const response = await apiClient.post('/api/cart/add', {
            bookId: book._id,
            bookTitle: book.bookTitle,
            authorName: book.authorName,
            imageURL: book.imageURL,
            Price: book.Price,
            category: book.category,
          });

          if (response.data.success) {
            set((state) => ({
              items: [...state.items, response.data.data],
            }));
            toast.success('Book added to cart');
            return true;
          }
        } catch (error) {
          if (error.response?.data?.error) {
            toast.error(error.response.data.error);
          } else {
            toast.error('Failed to add to cart');
          }
          return false;
        }
      },

      removeFromCart: async (itemId) => {
        try {
          const response = await apiClient.delete(`/api/cart/${itemId}`);
          
          if (response.data.success) {
            set((state) => ({
              items: state.items.filter((item) => item._id !== itemId),
            }));
            toast.success('Item removed from cart');
          }
        } catch (error) {
          toast.error('Failed to remove item');
        }
      },

      clearCart: async () => {
        try {
          await apiClient.delete('/api/cart');
          set({ items: [] });
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      },

      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => total + parseFloat(item.Price || 0), 0);
      },

      getTotalItems: () => {
        return get().items.length;
      },

      isInCart: (bookId) => {
        const items = get().items;
        return items.some((item) => item.original_id === bookId);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);