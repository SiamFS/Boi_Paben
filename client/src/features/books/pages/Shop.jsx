import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Filter, SortAsc } from 'lucide-react';
import { bookService } from '../services/bookService';
import { bookCategories } from '@/lib/utils';
import BookGrid from '../components/BookGrid';
import { Button } from '@/components/ui/Button';

export default function Shop() {
  const [sortOrder, setSortOrder] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [view, setView] = useState('grid');

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['shopBooks', sortOrder, selectedCategory],
    queryFn: () => bookService.getAllBooks({
      sort: sortOrder ? 'Price' : 'createdAt',
      order: sortOrder || 'desc',
      category: selectedCategory,
    }),
  });

  const availableBooks = books.filter((book) => book.availability !== 'sold');

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-gradient-to-r from-primary/10 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Book Shop</h1>
            <p className="text-muted-foreground">
              Discover amazing books at great prices
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {bookCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-5 w-5 text-muted-foreground" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input"
            >
              <option value="">Sort by Date</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>

          <div className="ml-auto flex gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
            >
              Grid
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
          </div>
        </div>        {availableBooks.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No books found in this category
            </p>
          </div>
        ) : (
          <BookGrid books={availableBooks} loading={isLoading} view={view} />
        )}
      </div>
    </div>
  );
}