import NodeCache from 'node-cache';
import { getCollection } from '../config/database.js';

// Cache with different TTLs for different data
const searchCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const suggestionCache = new NodeCache({ stdTTL: 3600 }); // 1 hour
const trendingCache = new NodeCache({ stdTTL: 7200 }); // 2 hours

export class SearchService {
  static async searchBooks(query, filters = {}, page = 1, limit = 20, userId = null) {
    try {
      const booksCollection = getCollection('books');
      const skip = (page - 1) * limit;
      
      // Build search query
      const searchQuery = this.buildSearchQuery(query, filters);
      
      // Log search for trending analysis
      if (query.trim()) {
        this.logSearch(query, userId);
      }
      
      // Execute search with sorting
      const sortOption = this.getSortOption(filters.sortBy);
      
      const [books, total] = await Promise.all([
        booksCollection
          .find(searchQuery)
          .sort(sortOption)
          .skip(skip)
          .limit(parseInt(limit))
          .toArray(),
        booksCollection.countDocuments(searchQuery)
      ]);
      
      return {
        books,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  static buildSearchQuery(query, filters) {
    const searchQuery = {};
    
    // Text search
    if (query && query.trim()) {
      searchQuery.$or = [
        { title: { $regex: query.trim(), $options: 'i' } },
        { author: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
        { category: { $regex: query.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(query.trim(), 'i')] } }
      ];
    }
    
    // Category filter
    if (filters.category) {
      searchQuery.category = { $regex: filters.category, $options: 'i' };
    }
    
    // Author filter
    if (filters.author) {
      searchQuery.author = { $regex: filters.author, $options: 'i' };
    }
    
    // Price range filter
    if (filters.priceMin || filters.priceMax) {
      searchQuery.price = {};
      if (filters.priceMin) {
        searchQuery.price.$gte = parseFloat(filters.priceMin);
      }
      if (filters.priceMax) {
        searchQuery.price.$lte = parseFloat(filters.priceMax);
      }
    }
    
    // Condition filter
    if (filters.condition) {
      searchQuery.condition = filters.condition;
    }
    
    // Publish year filter
    if (filters.publishYear) {
      searchQuery.publishYear = parseInt(filters.publishYear);
    }
    
    // Language filter
    if (filters.language && filters.language !== 'all') {
      searchQuery.language = filters.language;
    }
    
    // Availability filter
    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'available') {
        searchQuery.status = 'available';
        searchQuery.quantity = { $gt: 0 };
      }
    }
    
    // Always filter out deleted books
    searchQuery.status = { $ne: 'deleted' };
    
    return searchQuery;
  }

  static getSortOption(sortBy) {
    switch (sortBy) {
      case 'price-low':
        return { price: 1 };
      case 'price-high':
        return { price: -1 };
      case 'newest':
        return { createdAt: -1 };
      case 'rating':
        return { rating: -1, reviewCount: -1 };
      case 'popular':
        return { viewCount: -1, salesCount: -1 };
      case 'relevance':
      default:
        return { _id: -1 }; // Default to newest
    }
  }

  static async getSuggestions(query, limit = 8) {
    const cacheKey = `suggestions_${query.toLowerCase()}_${limit}`;
    
    // Check cache first
    const cached = suggestionCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const booksCollection = getCollection('books');
      
      const suggestions = [];
      
      // Book title suggestions
      const titleMatches = await booksCollection
        .find(
          { 
            title: { $regex: query, $options: 'i' },
            status: { $ne: 'deleted' }
          },
          { projection: { title: 1, author: 1, coverImage: 1 } }
        )
        .limit(3)
        .toArray();
      
      titleMatches.forEach(book => {
        suggestions.push({
          type: 'book',
          title: book.title,
          subtitle: `by ${book.author}`,
          image: book.coverImage
        });
      });
      
      // Author suggestions
      const authorMatches = await booksCollection
        .aggregate([
          {
            $match: {
              author: { $regex: query, $options: 'i' },
              status: { $ne: 'deleted' }
            }
          },
          {
            $group: {
              _id: '$author',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 2 }
        ])
        .toArray();
      
      authorMatches.forEach(author => {
        suggestions.push({
          type: 'author',
          title: author._id,
          subtitle: `${author.count} book${author.count > 1 ? 's' : ''}`
        });
      });
      
      // Category suggestions
      const categoryMatches = await booksCollection
        .aggregate([
          {
            $match: {
              category: { $regex: query, $options: 'i' },
              status: { $ne: 'deleted' }
            }
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 2 }
        ])
        .toArray();
      
      categoryMatches.forEach(category => {
        suggestions.push({
          type: 'category',
          title: category._id,
          subtitle: `${category.count} book${category.count > 1 ? 's' : ''}`
        });
      });
      
      // Limit total suggestions
      const limitedSuggestions = suggestions.slice(0, parseInt(limit));
      
      // Cache the results
      suggestionCache.set(cacheKey, limitedSuggestions);
      
      return limitedSuggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  static async getTrendingSearches(limit = 10) {
    const cacheKey = `trending_searches_${limit}`;
    
    // Check cache first
    const cached = trendingCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const searchLogsCollection = getCollection('searchLogs');
      
      // Get trending searches from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const trending = await searchLogsCollection
        .aggregate([
          {
            $match: {
              timestamp: { $gte: sevenDaysAgo },
              query: { $ne: '', $exists: true }
            }
          },
          {
            $group: {
              _id: { $toLower: '$query' },
              count: { $sum: 1 },
              lastSearched: { $max: '$timestamp' }
            }
          },
          { 
            $match: { 
              count: { $gte: 2 } // At least 2 searches
            }
          },
          { $sort: { count: -1, lastSearched: -1 } },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 0,
              query: '$_id',
              count: 1
            }
          }
        ])
        .toArray();
      
      const trendingQueries = trending.map(item => item.query);
      
      // If no trending searches, return popular categories
      if (trendingQueries.length === 0) {
        const fallback = ['Programming', 'Fiction', 'Science', 'History', 'Business', 'Romance', 'Mystery', 'Fantasy'];
        trendingCache.set(cacheKey, fallback.slice(0, limit));
        return fallback.slice(0, limit);
      }
      
      // Cache the results
      trendingCache.set(cacheKey, trendingQueries);
      
      return trendingQueries;
    } catch (error) {
      console.error('Error getting trending searches:', error);
      // Return fallback trending searches
      const fallback = ['Programming', 'Fiction', 'Science', 'History', 'Business'];
      return fallback.slice(0, limit);
    }
  }

  static async logSearch(query, userId = null) {
    try {
      const searchLogsCollection = getCollection('searchLogs');
      
      await searchLogsCollection.insertOne({
        query: query.trim(),
        userId,
        timestamp: new Date(),
        ip: null // Could be added from request if needed
      });
    } catch (error) {
      // Don't fail the search if logging fails
      console.error('Error logging search:', error);
    }
  }

  static clearCache() {
    searchCache.flushAll();
    suggestionCache.flushAll();
    trendingCache.flushAll();
  }
}
