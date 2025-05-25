import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, SlidersHorizontal, BookOpen, User, Tag, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api-client';
import cache from '@/lib/cache';

export default function AdvancedSearch({ onResults, placeholder = "Search books..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  
  const searchRef = useRef(null);
  const suggestionTimeout = useRef(null);

  const [filters, setFilters] = useState({
    category: '',
    author: '',
    priceMin: '',
    priceMax: '',
    condition: '',
    publishYear: '',
    language: 'en',
    sortBy: 'relevance',
    availability: 'all'
  });

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));

    // Load trending searches
    loadTrendingSearches();
  }, []);

  useEffect(() => {
    // Handle click outside to close suggestions
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTrendingSearches = async () => {
    try {
      const cacheKey = 'trending_searches';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        setTrendingSearches(cached);
        return;
      }

      const response = await apiClient.get('/api/search/trending');
      if (response.data.success) {
        setTrendingSearches(response.data.searches);
        cache.set(cacheKey, response.data.searches, 3600); // Cache for 1 hour
      }
    } catch (error) {
      console.error('Error loading trending searches:', error);
      // Fallback trending searches
      setTrendingSearches([
        'Programming', 'Fiction', 'Science', 'History', 'Business'
      ]);
    }
  };

  const getSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const cacheKey = `suggestions_${searchQuery.toLowerCase()}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        setSuggestions(cached);
        return;
      }

      const response = await apiClient.get('/api/search/suggestions', {
        params: { q: searchQuery, limit: 8 }
      });

      if (response.data.success) {
        const suggestions = response.data.suggestions;
        setSuggestions(suggestions);
        cache.set(cacheKey, suggestions, 1800); // Cache for 30 minutes
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);

    // Debounce suggestions
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }

    suggestionTimeout.current = setTimeout(() => {
      getSuggestions(value);
    }, 300);
  };

  const handleSearch = async (searchQuery = query, searchFilters = filters) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      // Save to recent searches
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updatedRecent = [searchQuery, ...recent.filter(s => s !== searchQuery)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      setRecentSearches(updatedRecent.slice(0, 5));

      // Perform search
      const response = await apiClient.post('/api/search', {
        query: searchQuery,
        filters: searchFilters,
        page: 1,
        limit: 20
      });

      if (response.data.success) {
        onResults?.(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
      onResults?.({ books: [], total: 0, suggestions: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (typeof suggestion === 'string') {
      setQuery(suggestion);
      handleSearch(suggestion);
    } else {
      setQuery(suggestion.title || suggestion.text);
      handleSearch(suggestion.title || suggestion.text);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (query.trim()) {
      handleSearch(query, newFilters);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: '',
      author: '',
      priceMin: '',
      priceMax: '',
      condition: '',
      publishYear: '',
      language: 'en',
      sortBy: 'relevance',
      availability: 'all'
    };
    setFilters(defaultFilters);
    
    if (query.trim()) {
      handleSearch(query, defaultFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'en' && value !== 'relevance' && value !== 'all'
  );

  return (
    <div className="w-full max-w-4xl mx-auto" ref={searchRef}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-l-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={hasActiveFilters ? "default" : "outline"}
            size="lg"
            className="px-6 py-4 rounded-none border-l-0"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-white text-primary text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(v => v !== '' && v !== 'en' && v !== 'relevance' && v !== 'all').length}
              </span>
            )}
          </Button>
          
          <Button
            onClick={() => handleSearch()}
            disabled={loading}
            size="lg"
            className="px-8 py-4 rounded-r-xl rounded-l-none"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (query || recentSearches.length > 0 || trendingSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
            >
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wide">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {suggestion.type === 'book' && <BookOpen className="w-4 h-4 text-primary" />}
                      {suggestion.type === 'author' && <User className="w-4 h-4 text-green-500" />}
                      {suggestion.type === 'category' && <Tag className="w-4 h-4 text-blue-500" />}
                      {!suggestion.type && <Search className="w-4 h-4 text-muted-foreground" />}
                      <span className="flex-1">{suggestion.title || suggestion.text || suggestion}</span>
                      {suggestion.type && (
                        <span className="text-xs text-muted-foreground capitalize">{suggestion.type}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !query && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wide">
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {trendingSearches.length > 0 && !query && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wide">
                    Trending
                  </div>
                  {trendingSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="flex-1">{search}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="academic">Academic</option>
                  <option value="children">Children</option>
                  <option value="science">Science</option>
                  <option value="history">History</option>
                  <option value="biography">Biography</option>
                  <option value="romance">Romance</option>
                  <option value="mystery">Mystery</option>
                  <option value="fantasy">Fantasy</option>
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  placeholder="Author name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range (৳)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Any Condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              {/* Publish Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publish Year
                </label>
                <input
                  type="number"
                  value={filters.publishYear}
                  onChange={(e) => handleFilterChange('publishYear', e.target.value)}
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-muted-foreground">
                {hasActiveFilters ? `${Object.values(filters).filter(v => v !== '' && v !== 'en' && v !== 'relevance' && v !== 'all').length} filter(s) applied` : 'No filters applied'}
              </span>
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button onClick={() => setShowFilters(false)}>
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}