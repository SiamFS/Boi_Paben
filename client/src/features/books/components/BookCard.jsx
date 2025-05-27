import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, BookOpen } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useCartStore } from '@/features/cart/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function BookCard({ book, listView = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const { addToCart, isInCart } = useCartStore();
  const inCart = isInCart(book._id);
  const isOwner = user?.email === book.email;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    await addToCart(book);
  };

  if (listView) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="card flex gap-4 p-4 h-full overflow-hidden group">
          <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden bg-muted rounded-lg">
            <img
              src={book.imageURL}
              alt={book.bookTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {isOwner && (
              <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                <BookOpen className="h-3 w-3" />
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                {book.bookTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                by {book.authorName}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {book.category}
              </p>
              {book.bookDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {book.bookDescription}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">
                {formatCurrency(book.Price)}
              </span>
              <div className="flex gap-2">
                <Link to={`/book/${book._id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                {!isOwner && (
                  <Button
                    size="sm"
                    variant={inCart ? 'secondary' : 'default'}
                    onClick={handleAddToCart}
                    disabled={inCart || book.availability === 'sold'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {inCart ? 'In Cart' : 'Add to Cart'}
                  </Button>
                )}
              </div>
            </div>
            {book.availability === 'sold' && (
              <span className="text-sm text-destructive mt-2">Sold Out</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card h-full flex flex-col overflow-hidden group">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={book.imageURL}
            alt={book.bookTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {isOwner && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
              <BookOpen className="h-4 w-4" />
            </div>
          )}

          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4"
            >
              <Link to={`/book/${book._id}`}>
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </motion.div>
          )}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {book.bookTitle}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            by {book.authorName}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            {book.category}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(book.Price)}
            </span>
            {!isOwner && (
              <Button
                size="sm"
                variant={inCart ? 'secondary' : 'default'}
                onClick={handleAddToCart}
                disabled={inCart || book.availability === 'sold'}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
          {book.availability === 'sold' && (
            <span className="text-xs text-destructive mt-2">Sold Out</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    bookTitle: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    Price: PropTypes.number.isRequired,
    imageURL: PropTypes.string.isRequired,
    availability: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    bookDescription: PropTypes.string,
  }).isRequired,
  listView: PropTypes.bool,
};