import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookService } from '@/features/books/services/bookService';
import { bookCategories } from '@/lib/utils';
import BookGrid from '@/features/books/components/BookGrid';
import { Button } from '@/components/ui/Button';
import ServerErrorHandler from '@/components/ui/ServerErrorHandler';

export default function CategoryBooks() {
  const [selectedCategory, setSelectedCategory] = useState(bookCategories[0]);
  const [retryCount, setRetryCount] = useState(0);
  const { data: books = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categoryBooks', selectedCategory],
    queryFn: () => bookService.getBooksByCategory(selectedCategory),
    retry: (failureCount, error) => {
      if (error?.code === 'NETWORK_ERROR' || error?.status >= 500) {
        return failureCount < 2; // Fewer retries for category section
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    suspense: false,
  });
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await refetch();
  };

  // Backend already filters sold books, no need for frontend filtering
  const filteredBooks = books;

  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground">Find your next favorite book by category</p>
        </motion.div>

        {!error && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {bookCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground scale-105'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {error && error?.code !== 'NETWORK_ERROR' ? (
          <div className="py-8">
            <ServerErrorHandler 
              error={error} 
              onRetry={handleRetry}
              retryCount={retryCount}
            />
          </div>
        ) : !error ? (
          <>
            {!isLoading && filteredBooks.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-lg">
                  No books found in {selectedCategory} category
                </p>
              </div>
            ) : (
              <>
                <BookGrid books={filteredBooks.slice(0, 10)} loading={isLoading} />
                
                {!isLoading && filteredBooks.length > 0 && (
                  <div className="text-center mt-12">
                    <Link to="/shop">
                      <Button size="lg" variant="outline">
                    View All Books
                  </Button>
                </Link>
              </div>
            )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}