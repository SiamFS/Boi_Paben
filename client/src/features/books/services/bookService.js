import apiClient from '@/lib/api-client';
import cache from '@/lib/cache';

export const bookService = {
  async getLatestBooks(limit = 10) {
    try {
      const response = await apiClient.get('/api/books/latest', {
        params: { limit },
        priority: 'low' // Low priority for latest books
      });
      // Handle both array and object response formats
      return response.data.books || response.data;
    } catch (error) {
      // Try to get from cache as fallback
      const cachedBooks = cache.get(`/api/books/latest`);
      if (cachedBooks) {
        return cachedBooks.books || cachedBooks;
      }
      throw error;
    }
  },

  async getAllBooks(params = {}) {
    try {
      const response = await apiClient.get('/api/books/all', { 
        params,
        priority: params.priority || 'low' // Default to low priority for bulk data
      });
      return response.data;
    } catch (error) {
      // Try to get from cache as fallback
      const cachedBooks = cache.get('/api/books/all');
      if (cachedBooks) {
        return cachedBooks;
      }
      throw error;
    }
  },

  async getBookById(id) {
    try {
      const response = await apiClient.get(`/api/books/${id}`, {
        priority: 'high' // High priority for individual book details
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async searchBooks(query) {
    try {
      const response = await apiClient.get(`/api/books/search/${query}`, {
        priority: 'high' // High priority for search results
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBooksByCategory(category) {
    try {
      const response = await apiClient.get(`/api/books/category/${category}`, {
        priority: 'low' // Low priority for category browsing
      });
      return response.data;
    } catch (error) {
      // Try to get from cache as fallback
      const cachedBooks = cache.get(`/api/books/category/${category}`);
      if (cachedBooks) {
        return cachedBooks;
      }
      throw error;
    }
  },

  async getUserBooks(email) {
    try {
      const response = await apiClient.get(`/api/books/user/${email}`, {
        priority: 'normal' // Normal priority for user's books
      });
      return response.data;
    } catch (error) {
      // Try to get from cache as fallback
      const cachedBooks = cache.get(`/api/books/user/${email}`);
      if (cachedBooks) {
        return cachedBooks;
      }
      throw error;
    }
  },
  async uploadBook(bookData) {
    try {
      const response = await apiClient.post('/api/books/upload', bookData);
      // Clear all book list caches after upload
      cache.delete('/api/books/latest');
      cache.delete('/api/books/all');
      cache.delete(`/api/books/category/${bookData.category}`);
      cache.delete(`/api/books/user/${bookData.email}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateBook(id, bookData) {
    const response = await apiClient.patch(`/api/books/${id}`, bookData);
    // Clear all book list caches after update
    cache.delete('/api/books/latest');
    cache.delete('/api/books/all');
    if (bookData.category) {
      cache.delete(`/api/books/category/${bookData.category}`);
    }
    if (bookData.email) {
      cache.delete(`/api/books/user/${bookData.email}`);
    }
    return response.data;
  },

  async deleteBook(id) {
    const response = await apiClient.delete(`/api/books/${id}`);
    // Clear all book list caches after delete
    cache.delete('/api/books/latest');
    cache.delete('/api/books/all');
    return response.data;
  },

  async reportBook(reportData) {
    const response = await apiClient.post('/api/reports', reportData);
    return response.data;
  },
  async uploadImage(file) {
    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error('Image upload service is not configured. Please contact support.');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      return data.data.url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  },
};