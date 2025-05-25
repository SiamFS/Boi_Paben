import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter } from 'lucide-react';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import BookGrid from '../components/BookGrid';

export default function Search() {
  const { query: urlQuery } = useParams();
  const [searchResults, setSearchResults] = useState({
    books: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid');

  useEffect(() => {
    if (urlQuery) {
      // Trigger search with URL query
      handleSearchResults({ books: [], total: 0 });
      // The AdvancedSearch component will handle the actual search
    }
  }, [urlQuery]);

  const handleSearchResults = (results) => {
    setLoading(true);
    setSearchResults(results);
    setLoading(false);
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-primary/10 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <SearchIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Search Books</h1>
            <p className="text-muted-foreground">
              Find your next great read from thousands of books
            </p>
          </motion.div>

          {/* Advanced Search Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdvancedSearch 
              onResults={handleSearchResults}
              placeholder="Search by title, author, category..."
            />
          </motion.div>
        </div>
      </div>

      {/* Search Results */}
      <div className="container py-8">
        {searchResults.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {searchResults.total.toLocaleString()} book{searchResults.total !== 1 ? 's' : ''} found
              </h2>
              {urlQuery && (
                <span className="text-muted-foreground">
                  for "{urlQuery}"
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="w-4 h-4 space-y-1">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Grid */}
        {loading ? (
          <BookGrid books={[]} loading={true} view={view} />
        ) : searchResults.books.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No books found
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              {urlQuery 
                ? `No results found for "${urlQuery}". Try different keywords or adjust your filters.`
                : 'Start typing to search for books by title, author, or category.'
              }
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Filter className="w-4 h-4" />
              <span>Use filters to narrow down your search</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <BookGrid 
              books={searchResults.books} 
              loading={false} 
              view={view} 
            />
            
            {/* Pagination could be added here */}
            {searchResults.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="text-sm text-gray-500">
                  Page {searchResults.page} of {searchResults.totalPages}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}