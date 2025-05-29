import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Filter, SortAsc } from 'lucide-react';
import { bookService } from '../services/bookService';
import { bookCategories, filterPublicBooks } from '@/lib/utils';
import BookGrid from '../components/BookGrid';
import { Button } from '@/components/ui/Button';
import ServerErrorHandler from '@/components/ui/ServerErrorHandler';

export default function Shop() {
  const [sortOrder, setSortOrder] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [view, setView] = useState('grid');
  const [retryCount, setRetryCount] = useState(0);
  
  const { data: books = [], isLoading, error, refetch } = useQuery({
    queryKey: ['shopBooks', sortOrder, selectedCategory],
    queryFn: () => bookService.getAllBooks({
      sort: sortOrder ? 'Price' : 'createdAt',
      order: sortOrder || 'desc',
      category: selectedCategory,
    }),
    retry: (failureCount, error) => {
      // Retry up to 3 times for server errors
      if (error?.code === 'NETWORK_ERROR' || error?.status >= 500) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await refetch();
  };

  // Filter out old sold books for public listings
  const filteredBooks = filterPublicBooks(books);

  const renderContent = () => {
    if (error) {
      return (
        <ServerErrorHandler 
          error={error} 
          onRetry={handleRetry}
          retryCount={retryCount}
        />
      );
    }

    if (filteredBooks.length === 0 && !isLoading) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No books found in this category
          </p>
        </div>
      );
    }

    return (
      <BookGrid books={filteredBooks} loading={isLoading} view={view} error={error} />
    );
  };

  return (
    <div className="pt-20 min-h-screen">      <div className="bg-gradient-to-r from-primary/10 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Book Shop</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover amazing books at great prices
            </p>
          </motion.div>
        </div>
      </div><div className="container py-8">
        {!error && (
          <div className="space-y-4 mb-8">
            {/* Mobile-first layout for filters and controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filters section */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input flex-1 min-w-0 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    <option value="">All Categories</option>
                    {bookCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <SortAsc className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="input flex-1 min-w-0 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    <option value="">Sort by Date</option>
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* View toggle buttons - better mobile positioning */}
              <div className="flex gap-2 justify-center sm:justify-end">
                <Button
                  variant={view === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('grid')}
                  disabled={isLoading}
                  className="text-xs sm:text-sm px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">Grid</span>
                  <span className="sm:hidden">Grid</span>
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                  disabled={isLoading}
                  className="text-xs sm:text-sm px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">List</span>
                  <span className="sm:hidden">List</span>
                </Button>
              </div>
            </div>

            {/* Results count and mobile-friendly info */}
            {!isLoading && filteredBooks.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
                <span>{filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found</span>
                <span className="hidden sm:inline">
                  Viewing in {view} view
                </span>
              </div>
            )}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}