import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, AlertCircle, MapPin, Phone, Shield, Package } from 'lucide-react';
import { bookService } from '../services/bookService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/features/cart/store/cartStore';
import { formatCurrency, reportReasons } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ContentLoadingSkeleton } from '@/components/ui/LoadingComponents';
import ServerErrorHandler from '@/components/ui/ServerErrorHandler';
import toast from 'react-hot-toast';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCartStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const { data: book, isLoading, error, refetch } = useQuery({
    queryKey: ['book', id],
    queryFn: () => bookService.getBookById(id),
    retry: (failureCount, error) => {
      if (error?.code === 'NETWORK_ERROR' || error?.status >= 500) {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
  });
  // Check if book was listed more than 12 hours ago
  const isOldListing = book?.createdAt && new Date() - new Date(book.createdAt) > 12 * 60 * 60 * 1000;

  if (error) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container py-8">
          <ServerErrorHandler 
            error={error}
            onRetry={refetch}
            title="Failed to load book details"
            description="We couldn't fetch the book information. This might be due to server maintenance."
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container py-8">
          <ContentLoadingSkeleton />
        </div>
      </div>
    );
  }
  if (!book) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-xl">Book not found</p>
      </div>
    );
  }

  const inCart = isInCart(id);
  const isOwner = user?.email === book?.email;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await addToCart(book);
  };
  const handleReport = async () => {
    if (!user) {
      toast.error('Please login to report');
      return;
    }

    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }

    try {
      await bookService.reportBook({
        bookId: book._id,
        bookTitle: book.bookTitle,
        sellerName: book.seller,
        sellerEmail: book.email,
        reason: reportReason,
      });
      toast.success('Report submitted successfully');
      setShowReportModal(false);
    } catch (error) {
      if (error.response?.data?.message === 'You have already reported this book') {
        toast.error('You have already reported this book');
      } else {
        toast.error('Failed to submit report');
      }
    }  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="container py-8">        {/* Warning for sold books listed more than 12 hours ago */}
        {book.availability === 'sold' && book.soldAt && 
         new Date() - new Date(book.soldAt) > 12 * 60 * 60 * 1000 && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                This book has been sold and was removed from public listings after 12 hours.
              </p>
            </div>
          </div>
        )}

        {/* Warning for books listed more than 12 hours ago */}
        {isOldListing && book.availability === 'available' && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                This book was listed more than 12 hours ago. Please verify availability with the seller.
              </p>
            </div>
          </div>
        )}
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="aspect-[3/4] max-w-sm mx-auto overflow-hidden rounded-lg bg-muted shadow-lg">
                <img
                  src={book.imageURL}
                  alt={book.bookTitle}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="mt-6">
                {isOwner ? (
                  <Button className="w-full" disabled>
                    Your Book
                  </Button>                ) : (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={inCart || book.availability === 'sold'}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {(() => {
                        if (inCart) return 'In Cart';
                        if (book.availability === 'sold') return 'Sold Out';
                        return 'Add to Cart';
                      })()}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setShowReportModal(true)}
                      title="Report this listing"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Book Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >            {/* Header */}
            <div className="border-b pb-6">
              {book.availability === 'sold' && (
                <span className="inline-block px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded-full mb-4">
                  Sold Out
                </span>
              )}
              <h1 className="text-4xl font-bold mb-3 leading-tight">{book.bookTitle}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.authorName}</p>
              
              <div className="flex flex-wrap items-center gap-6">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(book.Price)}
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {book.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{book.bookDescription}</p>
            </div>

            {/* Book Details */}
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Book Details</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {book.authenticity && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Authenticity</p>
                      <p className="font-medium">{book.authenticity}</p>
                    </div>
                  </div>
                )}
                
                {book.productCondition && (
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <p className="font-medium">{book.productCondition}</p>
                    </div>
                  </div>
                )}

                {book.publisher && (
                  <div>
                    <p className="text-sm text-muted-foreground">Publisher</p>
                    <p className="font-medium">{book.publisher}</p>
                  </div>
                )}

                {book.edition && (
                  <div>
                    <p className="text-sm text-muted-foreground">Edition</p>
                    <p className="font-medium">{book.edition}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Information - Hidden */}
          </motion.div>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold mb-4">Report This Book</h3>
            <p className="text-muted-foreground mb-4">
              Why do you want to report this post?
            </p>
            
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="input w-full mb-6"
            >
              <option value="">Select a reason</option>
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReport}
              >
                Submit Report
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}