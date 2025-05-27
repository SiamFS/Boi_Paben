import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    
    // Load categories for filter
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/api/books/categories');
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        setCategories([
          'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
          'Biography', 'Self-Help', 'Children', 'Art', 'Religion'
        ]);
      }
    };
    
    fetchCategories();
  }, [urlQuery]);

  const performSearch = async (query, filterParams = {}) => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/books/search/${query}`, {
        params: { ...filterParams }
      });
      
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">
          {searchResults.length > 0
            ? `Search Results for "${searchTerm}"`
            : 'Search Books'}
        </h1>

        <div className="space-y-4">
          <SearchBar
            autoFocus
            onSearch={(searchQuery) => {
              setSearchTerm(searchQuery);
              performSearch(searchQuery, filters);
            }}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border rounded-lg dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="category-filter" className="block text-sm font-medium mb-1">Category</label>
                  <select
                    id="category-filter"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
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
                  <label htmlFor="min-price" className="block text-sm font-medium mb-1">Min Price</label>
                  <input
                    id="min-price"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                    placeholder="Min Price"
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="max-price" className="block text-sm font-medium mb-1">Max Price</label>
                  <input
                    id="max-price"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    placeholder="Max Price"
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="condition-filter" className="block text-sm font-medium mb-1">Condition</label>
                  <select
                    id="condition-filter"
                    value={filters.condition}
                    onChange={(e) =>
                      setFilters({ ...filters, condition: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
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

              <div className="flex justify-end mt-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button type="button" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <BookGrid books={searchResults} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No books found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </motion.div>
  );
}
