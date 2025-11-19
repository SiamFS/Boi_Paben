import apiClient from '@/lib/api-client';

class RecommendationService {
  constructor() {
    // Note: Caching is now handled by TanStack Query
  }

  /**
   * Get personalized recommendations or fallback to latest books
   * Note: Caching is handled by TanStack Query, not this service
   */
  async getRecommendations(userId = null, limit = 10) {
    try {
      const response = await apiClient.get('/api/books/recommendations', {
        params: { userId, limit },
        priority: 'low' // Non-critical content, use low priority
      });
      
      if (response.data.success) {
        return response.data.books;
      }
      
      // If no recommendations, return latest books
      return await this.getLatestBooks(limit);
    } catch (error) {
      // Fallback to latest books
      return await this.getLatestBooks(limit);
    }
  }

  /**
   * Get latest books
   */
  async getLatestBooks(limit = 10) {
    try {
      const response = await apiClient.get('/api/books/latest', {
        params: { limit },
        priority: 'low' // Non-critical content, use low priority
      });
      
      if (response.data.success) {
        return response.data.books;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get banner books (recommended or latest)
   */
  async getBannerBooks(limit = 5) {
    try {
      // Try to get recommended books first
      const recommendations = await this.getRecommendations(null, limit);
      
      if (recommendations && recommendations.length >= limit) {
        return recommendations.slice(0, limit);
      }
      
      // Fallback to latest books
      return await this.getLatestBooks(limit);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get books similar to a given book
   */
  async getSimilarBooks(bookId, limit = 6) {
    try {
      const response = await apiClient.get(`/api/books/${bookId}/similar`, {
        params: { limit }
      });
      
      if (response.data.success) {
        return response.data.books;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get personalized recommendations for a specific user
   */
  async getPersonalizedRecommendations(userId, categories = [], limit = 10) {
    try {
      const response = await apiClient.post('/api/books/personalized', {
        userId,
        categories,
        limit
      });
      
      if (response.data.success) {
        return response.data.books;
      }
      
      return await this.getRecommendations(userId, limit);
    } catch (error) {
      return await this.getRecommendations(userId, limit);
    }
  }

  /**
   * Clear all cache (handled by TanStack Query, kept for backward compatibility)
   */
  clearCache() {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Cache cleared (handled by TanStack Query)');
    }
  }
}

export default new RecommendationService();