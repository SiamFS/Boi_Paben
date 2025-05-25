import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookService } from '@/features/books/services/bookService';
import { bookCategories } from '@/lib/utils';
import BookGrid from '@/features/books/components/BookGrid';
import { Button } from '@/components/ui/Button';

export default function CategoryBooks() {
  const [selectedCategory, setSelectedCategory] = useState(bookCategories[0]);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['categoryBooks', selectedCategory],
    queryFn: () => bookService.getBooksByCategory(selectedCategory),
  });

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

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {bookCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground scale-105'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <BookGrid books={books.slice(0, 10)} loading={isLoading} />

        <div className="text-center mt-12">
          <Link to="/shop">
            <Button size="lg" variant="outline">
              View All Books
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}