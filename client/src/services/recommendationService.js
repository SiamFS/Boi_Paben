import apiClient from '@/lib/api-client';
import cache from '@/lib/cache';

class RecommendationService {
  constructor() {
    this.cacheTime = 1800; // 30 minutes
  }
  async getRecommendations(userId = null, limit = 10) {
    const cacheKey = `recommendations_${userId || 'anonymous'}_${limit}`;
    
    // Check cache first
    const cachedRecommendations = cache.get(cacheKey);
    if (cachedRecommendations) {
      return cachedRecommendations;
    }

    try {
      const response = await apiClient.get('/api/books/recommendations', {
        params: { userId, limit },
        priority: 'low' // Non-critical content, use low priority
      });
      
      if (response.data.success) {
        // Cache the recommendations
        cache.set(cacheKey, response.data.books, this.cacheTime);
        return response.data.books;
      }
      
      // If no recommendations, return latest books
      return await this.getLatestBooks(limit);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to latest books
      return await this.getLatestBooks(limit);
    }
  }
  async getLatestBooks(limit = 10) {
    const cacheKey = `latest_books_${limit}`;
    
    // Check cache first
    const cachedBooks = cache.get(cacheKey);
    if (cachedBooks) {
      return cachedBooks;
    }

    try {
      const response = await apiClient.get('/api/books/latest', {
        params: { limit },
        priority: 'low' // Non-critical content, use low priority
      });
      
      if (response.data.success) {
        // Cache for shorter time since these are latest
        cache.set(cacheKey, response.data.books, 900); // 15 minutes
        return response.data.books;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching latest books:', error);
      return [];
    }
  }  async getBannerBooks(limit = 5) {
    const cacheKey = `banner_books_${limit}`;
    
    // Check cache first
    const cachedBooks = cache.get(cacheKey);
    if (cachedBooks) {
      return cachedBooks;
    }

    try {
      // Try to get recommended books first
      const recommendations = await this.getRecommendations(null, limit);
      
      if (recommendations && recommendations.length >= limit) {
        const bannerBooks = recommendations.slice(0, limit);
        cache.set(cacheKey, bannerBooks, this.cacheTime);
        return bannerBooks;
      }
      
      // Fallback to latest books
      const latestBooks = await this.getLatestBooks(limit);
      cache.set(cacheKey, latestBooks, this.cacheTime);
      return latestBooks;
    } catch (error) {
      console.error('Error fetching banner books:', error);
      return [];
    }
  }

  async getSimilarBooks(bookId, limit = 6) {
    const cacheKey = `similar_books_${bookId}_${limit}`;
    
    // Check cache first
    const cachedBooks = cache.get(cacheKey);
    if (cachedBooks) {
      return cachedBooks;
    }

    try {
      const response = await apiClient.get(`/api/books/${bookId}/similar`, {
        params: { limit }
      });
      
      if (response.data.success) {
        cache.set(cacheKey, response.data.books, this.cacheTime);
        return response.data.books;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching similar books:', error);
      return [];
    }
  }

  async getPersonalizedRecommendations(userId, categories = [], limit = 10) {
    const cacheKey = `personalized_${userId}_${categories.join('-')}_${limit}`;
    
    // Check cache first
    const cachedBooks = cache.get(cacheKey);
    if (cachedBooks) {
      return cachedBooks;
    }

    try {
      const response = await apiClient.post('/api/books/personalized', {
        userId,
        categories,
        limit
      });
      
      if (response.data.success) {
        cache.set(cacheKey, response.data.books, this.cacheTime);
        return response.data.books;
      }
      
      return await this.getRecommendations(userId, limit);
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      return await this.getRecommendations(userId, limit);
    }
  }

  clearCache() {
    // Clear all recommendation-related cache
    cache.clear();
  }
}

export default new RecommendationService();