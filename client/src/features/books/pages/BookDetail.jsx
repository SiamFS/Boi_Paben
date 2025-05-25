import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, AlertCircle, MapPin, Phone, Shield, Package } from 'lucide-react';
import { bookService } from '../services/bookService';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useCartStore } from '@/features/cart/store/cartStore';
import { formatCurrency, reportReasons } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCartStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: () => bookService.getBookById(id),
  });

  const inCart = isInCart(id);
  const isOwner = user?.email === book?.email;

  if (isLoading) return <LoadingScreen />;
  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Book not found</p>
      </div>
    );
  }

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
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <img
                src={book.imageURL}
                alt={book.bookTitle}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-4">
              {isOwner ? (
                <Button className="flex-1" disabled>
                  Your Book
                </Button>
              ) : (
                <>
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={inCart || book.availability === 'sold'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {inCart ? 'In Cart' : book.availability === 'sold' ? 'Sold Out' : 'Add to Cart'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setShowReportModal(true)}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              {book.availability === 'sold' && (
                <span className="inline-block px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded-full mb-4">
                  Sold Out
                </span>
              )}
              <h1 className="text-3xl font-bold mb-2">{book.bookTitle}</h1>
              <p className="text-xl text-muted-foreground">by {book.authorName}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(book.Price)}
              </span>
              <span className="text-muted-foreground">
                Category: {book.category}
              </span>
            </div>

            <div className="prose max-w-none">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{book.bookDescription}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {book.authenticity && (
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Authenticity</p>
                    <p className="font-medium">{book.authenticity}</p>
                  </div>
                </div>
              )}
              
              {book.productCondition && (
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
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

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Seller Information</h3>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Sold by: <span className="font-medium text-foreground">{book.seller}</span>
                </p>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p>{book.streetAddress}</p>
                    <p>{book.cityTown}, {book.district}</p>
                    {book.zipCode && <p>Zip: {book.zipCode}</p>}
                  </div>
                </div>

                {book.contactNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm">{book.contactNumber}</p>
                  </div>
                )}
              </div>
            </div>
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