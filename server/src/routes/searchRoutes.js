import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { optionalAuth } from '../middleware/auth.js';
import { SearchService } from '../services/searchService.js';

const router = express.Router();

// Advanced search with filters
router.post('/', optionalAuth, asyncHandler(async (req, res) => {
  const { query, filters = {}, page = 1, limit = 20 } = req.body;
  
  try {
    const results = await SearchService.searchBooks(query, filters, page, limit, req.user?.uid);
    
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
}));

// Get search suggestions
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { q, limit = 8 } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({
      success: true,
      suggestions: []
    });
  }
  
  try {
    const suggestions = await SearchService.getSuggestions(q, limit);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
}));

// Get trending searches
router.get('/trending', asyncHandler(async (req, res) => {
  try {
    const searches = await SearchService.getTrendingSearches();
    
    res.json({
      success: true,
      searches
    });
  } catch (error) {
    console.error('Trending searches error:', error);
    res.json({
      success: true,
      searches: ['Programming', 'Fiction', 'Science', 'History', 'Business']
    });
  }
}));

export default router;
