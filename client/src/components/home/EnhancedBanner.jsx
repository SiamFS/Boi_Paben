import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import recommendationService from '@/services/recommendationService';
import toast from 'react-hot-toast';

export default function EnhancedBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerBooks, setBannerBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadBannerBooks = async () => {
      try {
        setLoading(true);
        const books = await recommendationService.getBannerBooks(5);
        setBannerBooks(books);
      } catch (error) {
        console.error('Error loading banner books:', error);
        toast.error('Failed to load featured books');
      } finally {
        setLoading(false);
      }
    };

    loadBannerBooks();
  }, []);

  useEffect(() => {
    if (bannerBooks.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerBooks.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerBooks.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerBooks.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerBooks.length) % bannerBooks.length);
  };

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bannerBooks.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMTgzLCAxMTIsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="container relative py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl lg:text-7xl font-bold leading-tight mb-8"
            >
              Discover Your Next{' '}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Great Read
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed"
            >
              Buy and sell books at the best prices. Join thousands of book lovers in our community.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/shop">
                <Button size="lg" className="text-lg px-8 py-4 h-auto">
                  Browse Books
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto">
                  Sell Your Books
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const currentBook = bannerBooks[currentSlide];

  return (
    <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden min-h-[80vh]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMTgzLCAxMTIsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="container relative py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold leading-tight"
              >
                {currentBook.title || 'Featured Book'}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                {currentBook.author && `by ${currentBook.author}`}
              </motion.p>

              {currentBook.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-base text-muted-foreground line-clamp-3"
                >
                  {currentBook.description}
                </motion.p>
              )}

              {currentBook.rating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(currentBook.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({currentBook.rating}/5)
                  </span>
                </motion.div>
              )}

              {currentBook.price && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-3xl font-bold text-primary">
                    ৳{currentBook.price}
                  </span>
                  {currentBook.originalPrice && currentBook.originalPrice > currentBook.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      ৳{currentBook.originalPrice}
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to={`/books/${currentBook._id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  View Details
                </Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Book Carousel Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-2xl blur-xl transform rotate-6"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-orange-200 dark:border-gray-700">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={currentBook.coverImage || '/placeholder-book.jpg'}
                          alt={currentBook.title || 'Featured Book'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button size="sm" variant="secondary" className="rounded-full">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              {bannerBooks.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {bannerBooks.length > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {bannerBooks.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-primary scale-125'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}