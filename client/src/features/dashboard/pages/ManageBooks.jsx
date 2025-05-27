import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { bookService } from '@/features/books/services/bookService';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ManageBooks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['userBooks', user?.email],
    queryFn: () => bookService.getUserBooks(user.email),
    enabled: !!user?.email,
  });

  const deleteBookMutation = useMutation({
    mutationFn: bookService.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries(['userBooks']);
      toast.success('Book deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete book');
    },
  });

  const handleDeleteBook = (bookId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteBookMutation.mutate(bookId);
    }
  };

  const filteredBooks = books.filter(book =>
    book.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <Link to="/dashboard/upload">
          <Button className="w-full sm:w-auto">
            <BookOpen className="h-4 w-4 mr-2" />
            Upload New Book
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search books by title, author, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full max-w-md"
        />
      </div>      {isLoading ? (        <div className="grid gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`skeleton-book-${index}`} className="card p-6">
              <div className="flex gap-4">
                <div className="skeleton h-20 w-16" />
                <div className="flex-1">
                  <div className="skeleton h-6 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2 mb-2" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground mb-6">
            {books.length === 0 
              ? "You haven't uploaded any books yet." 
              : "No books match your search criteria."}
          </p>
          {books.length === 0 && (
            <Link to="/dashboard/upload">
              <Button>Upload Your First Book</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={book.imageURL}
                    alt={book.bookTitle}
                    className="h-32 w-24 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.src = '/placeholder-book.png';
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {book.bookTitle}
                      </h3>
                      <p className="text-muted-foreground mb-1">
                        by {book.authorName}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Category: {book.category}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-primary">
                          {formatCurrency(book.Price)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          book.availability === 'available' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {book.availability === 'available' ? 'Available' : 'Sold'}
                        </span>
                      </div>
                      {book.bookDescription && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {book.bookDescription}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                      <Link to={`/book/${book._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/dashboard/edit/${book._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBook(book._id, book.bookTitle)}
                        disabled={deleteBookMutation.isPending}
                        className="w-full text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}