import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, BookOpen } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/features/cart/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function BookCard({ book, listView = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user } = useAuth();
  const { addToCart, isInCart } = useCartStore();
  const inCart = isInCart(book._id);
  const isOwner = user?.email === book?.email;

  // Check if book was sold more than 12 hours ago
  const isOldSoldBook = book.availability === 'sold' && book.soldAt && 
    new Date() - new Date(book.soldAt) > 12 * 60 * 60 * 1000;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    if (book.availability === 'sold') {
      toast.error('This book is no longer available');
      return;
    }
    
    await addToCart(book);
  };

  // Truncate text helper
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };  if (listView) {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="card flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-5 h-full overflow-hidden bg-gradient-to-r from-card/50 to-card border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
          {/* Mobile-optimized layout */}
          <div className="flex gap-3 sm:contents">
            <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 overflow-hidden bg-muted rounded-xl shadow-sm">
              <img
                src={book.imageURL}
                alt={book.bookTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Owner Badge */}
              {isOwner && (
                <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-blue-500 text-white p-1 sm:p-1.5 rounded-full shadow-lg">
                  <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </div>
              )}

              {/* Sold Badge */}
              {book.availability === 'sold' && (
                <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs font-semibold shadow-lg">
                  SOLD
                </div>
              )}
            </div>

            <div className="flex-grow flex flex-col justify-between min-w-0">
              <div className="flex-grow space-y-1.5 sm:space-y-2">
                <h3 
                  className="font-bold text-base sm:text-lg leading-tight text-foreground hover:text-primary transition-colors duration-200 cursor-pointer line-clamp-2"
                  title={book.bookTitle}
                >
                  {truncateText(book.bookTitle, 35)}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  by {truncateText(book.authorName, 25)}
                </p>
                <div className="inline-block">
                  <span className="text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full font-medium">
                    {book.category}
                  </span>
                </div>
              </div>
              
              {/* Mobile price display */}
              <div className="flex items-center justify-between mt-2 sm:hidden">
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {formatCurrency(book.Price)}
                </span>
                {book.availability === 'sold' && (
                  <span className="text-xs text-destructive font-medium">Sold Out</span>
                )}
              </div>
            </div>
          </div>          {/* Desktop description and actions */}
          <div className="hidden sm:flex sm:flex-col sm:justify-between sm:min-w-0 sm:flex-grow">
            <div className="flex-grow space-y-2">
              {book.bookDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {truncateText(book.bookDescription, 100)}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {formatCurrency(book.Price)}
              </span>
              <div className="flex gap-2">
                <Link to={`/book/${book._id}`}>
                  <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-colors duration-200">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                {!isOwner && (
                  <Button
                    size="sm"
                    variant={inCart ? 'secondary' : 'default'}
                    onClick={handleAddToCart}
                    disabled={inCart || book.availability === 'sold'}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {inCart ? 'Added' : 'Add'}
                  </Button>
                )}
              </div>
            </div>
            {book.availability === 'sold' && (
              <span className="text-sm text-destructive mt-2 font-medium">• Sold Out</span>
            )}
          </div>

          {/* Mobile action buttons */}
          <div className="flex gap-2 sm:hidden">
            <Link to={`/book/${book._id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </Link>
            {!isOwner && (
              <Button
                size="sm"
                variant={inCart ? 'secondary' : 'default'}
                onClick={handleAddToCart}
                disabled={inCart || book.availability === 'sold'}
                className="flex-1 text-xs transition-all duration-200"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {inCart ? 'Added' : 'Add'}
              </Button>
            )}
          </div>

          {/* Owner-specific warnings */}
          {isOwner && isOldSoldBook && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ This book has been sold and was removed from public listings after 12 hours.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  return (
    <Link to={`/book/${book._id}`} className="block h-full no-underline">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative h-full group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className="relative h-full flex flex-col overflow-hidden bg-gradient-to-br from-card via-card to-card/80 border border-border/50 hover:border-border transition-all duration-300 rounded-xl shadow-sm hover:shadow-xl">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-t-xl">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={book.imageURL}
            alt={book.bookTitle}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Owner Badge */}
          {isOwner && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full shadow-lg">
              <BookOpen className="h-4 w-4" />
            </div>
          )}

          {/* Sold Badge */}
          {book.availability === 'sold' && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
              SOLD
            </div>
          )}          {/* Removed hover overlay to prevent flashing */}
        </div>

        {/* Content Container */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col bg-gradient-to-b from-card to-card/50">
          <div className="flex-grow space-y-1 sm:space-y-2">
            <h3 
              className="font-bold text-sm sm:text-base leading-tight text-foreground hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]" 
              title={book.bookTitle}
            >
              {book.bookTitle}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium min-h-[1rem] sm:min-h-[1.25rem] line-clamp-1">
              by {truncateText(book.authorName, 15)}
            </p>
            <div className="inline-block">
              <span className="text-xs bg-secondary/80 text-secondary-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                {book.category}
              </span>
            </div>
          </div>
          
          <div className="mt-auto space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {formatCurrency(book.Price)}
              </span>
              {!isOwner && (
                <Button
                  size="sm"
                  variant={inCart ? 'secondary' : 'default'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(e);
                  }}
                  disabled={inCart || book.availability === 'sold'}
                  className="transition-all duration-200 hover:scale-105 p-2 sm:p-2.5"
                >
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
            {book.availability === 'sold' && (
              <div className="text-center">
                <span className="text-xs sm:text-sm text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded-full">
                  • Sold Out
                </span>
                {isOwner && isOldSoldBook && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                      ⚠️ This book has been sold and was removed from public listings after 12 hours.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </Link>
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
    soldAt: PropTypes.string,
  }).isRequired,
  listView: PropTypes.bool,
};