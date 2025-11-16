import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { bookService } from '@/features/books/services/bookService';
import BookGrid from '@/features/books/components/BookGrid';
import ServerErrorHandler from '@/components/ui/ServerErrorHandler';

export default function LatestBooks() {
  const { data: books = [], isLoading, error, refetch } = useQuery({
    queryKey: ['latestBooks'],
    queryFn: () => bookService.getLatestBooks(10),
    retry: (failureCount, error) => {
      if (error?.code === 'NETWORK_ERROR' || error?.status >= 500) {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    suspense: false,
  });

  // Filter out old sold books for public listings
  const filteredBooks = books; // Already filtered by backend

  return (
    <section className="py-16 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Latest Books</h2>
          <p className="text-muted-foreground">Discover our newest additions</p>
        </motion.div>

        <BookGrid books={filteredBooks} loading={isLoading} />

        {!isLoading && filteredBooks.length === 0 && !error && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-lg">
              No books available yet. Check back soon!
            </p>
          </div>
        )}

        {error && error?.code !== 'NETWORK_ERROR' && (
          <div className="mt-8">
            <ServerErrorHandler 
              error={error}
              onRetry={refetch}
              title="Failed to load latest books"
              description="We couldn't fetch the latest books. This might be due to server maintenance."
            />
          </div>
        )}
      </div>
    </section>
  );
}