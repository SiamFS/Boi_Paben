import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import BookGrid from '../components/BookGrid';
import SearchBar from '../components/SearchBar';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api-client';

export default function Search() {
  const { query: urlQuery } = useParams();
  const [searchTerm, setSearchTerm] = useState(urlQuery || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  });
  useEffect(() => {
    if (urlQuery) {
      setSearchTerm(urlQuery);
      performSearch(urlQuery);
    }
  }, [urlQuery]);

  // Separate useEffect for fetching categories only once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/api/books/categories');
        if (response.data?.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        // Set empty array as fallback
        setCategories([]);
      }
    };
    
    fetchCategories();
  }, []); // Empty dependency array means this runs only once

  const performSearch = async (query, filterParams = {}) => {
    if (!query) return;
    
    setLoading(true);
    try {
      // Save search to recent searches
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const newRecent = [query, ...recent.filter(item => item !== query)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));

      const response = await apiClient.get(`/api/books/search/${query}`, {
        params: { ...filterParams }
      });
      
      const results = response.data?.books || response.data || [];
      setSearchResults(results);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    performSearch(searchTerm, filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    });
    performSearch(searchTerm);
    setShowFilters(false);
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (searchResults.length > 0) {
      return <BookGrid books={searchResults} />;
    }

    if (searchTerm) {
      return (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-medium mb-3 text-gray-900 dark:text-gray-100">
              No books found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any books matching "{searchTerm}". Try adjusting your search or filters.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
                clearFilters();
              }}
              variant="outline"
            >
              Clear Search
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">
          Start your search
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter a book title, author, or category to find great books.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section with Search */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
              {searchResults.length > 0
                ? `Search Results for "${searchTerm}"`
                : 'Search Books'}
            </h1>
            {searchResults.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                Found {searchResults.length} results
              </p>
            )}
          </motion.div>
          
          {/* Centered Search Bar */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-2xl">
              <SearchBar
                autoFocus
                size="large"
                placeholder="Search books, authors, categories..."
                onSearch={(searchQuery) => {
                  setSearchTerm(searchQuery);
                  performSearch(searchQuery, filters);
                }}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center mb-4">
            <Button
              type="button"
              variant="outline"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filters Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-white dark:bg-gray-800 border rounded-lg border-gray-200 dark:border-gray-700 mx-auto max-w-4xl shadow-sm mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="category-filter" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="min-price-filter" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Min Price (BDT)
                  </label>
                  <input
                    id="min-price-filter"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                    placeholder="0"
                    className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="max-price-filter" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Max Price (BDT)
                  </label>
                  <input
                    id="max-price-filter"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    placeholder="10000"
                    className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>                  <label htmlFor="condition-filter" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Condition
                  </label>
                  <select
                    id="condition-filter"
                    value={filters.condition}
                    onChange={(e) =>
                      setFilters({ ...filters, condition: e.target.value })
                    }
                    className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Condition</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
                <Button 
                  type="button" 
                  onClick={applyFilters}
                  className="px-6 py-2"
                >
                  Apply Filters
                </Button>              </div>
            </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderSearchResults()}
        </motion.div>
      </div>
    </div>
  );
}