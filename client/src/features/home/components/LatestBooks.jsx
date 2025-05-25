import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { bookService } from '@/features/books/services/bookService';
import BookGrid from '@/features/books/components/BookGrid';

export default function LatestBooks() {
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['latestBooks'],
    queryFn: () => bookService.getAllBooks({ limit: 10 }),
  });

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

        <BookGrid books={books} loading={isLoading} />
      </div>
    </section>
  );
}