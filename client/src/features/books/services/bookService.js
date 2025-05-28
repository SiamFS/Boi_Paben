import apiClient from '@/lib/api-client';

export const bookService = {
  async getAllBooks(params = {}) {
    const response = await apiClient.get('/api/books/all', { 
      params,
      priority: params.priority || 'low' // Default to low priority for bulk data
    });
    return response.data;
  },

  async getBookById(id) {
    const response = await apiClient.get(`/api/books/${id}`, {
      priority: 'high' // High priority for individual book details
    });
    return response.data;
  },

  async searchBooks(query) {
    const response = await apiClient.get(`/api/books/search/${query}`, {
      priority: 'high' // High priority for search results
    });
    return response.data;
  },

  async getBooksByCategory(category) {
    const response = await apiClient.get(`/api/books/category/${category}`, {
      priority: 'low' // Low priority for category browsing
    });
    return response.data;
  },

  async getUserBooks(email) {
    const response = await apiClient.get(`/api/books/user/${email}`, {
      priority: 'normal' // Normal priority for user's books
    });
    return response.data;
  },

  async uploadBook(bookData) {
    const response = await apiClient.post('/api/books/upload', bookData);
    return response.data;
  },

  async updateBook(id, bookData) {
    const response = await apiClient.patch(`/api/books/${id}`, bookData);
    return response.data;
  },

  async deleteBook(id) {
    const response = await apiClient.delete(`/api/books/${id}`);
    return response.data;
  },

  async reportBook(reportData) {
    const response = await apiClient.post('/api/reports', reportData);
    return response.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to upload image');
    }

    return data.data.url;
  },
};