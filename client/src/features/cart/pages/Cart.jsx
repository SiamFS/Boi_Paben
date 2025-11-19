import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, removeFromCart, fetchCart, getTotalPrice } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [address, setAddress] = useState({
    streetAddress: '',
    cityTown: '',
    district: '',
    zipCode: '',
    contactNumber: '',
  });

  // Memoize fetchCart to prevent recreation
  const stableFetchCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (user) {
      stableFetchCart();
    }
  }, [user?.uid, stableFetchCart]); // Only depend on user ID, not entire user object

  const totalPrice = getTotalPrice();
  const shippingCost = 50;  const grandTotal = totalPrice + shippingCost;

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (paymentMethod === 'card') return 'Pay with Card';
    return 'Confirm Order';
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const unavailableItems = items.filter((item) => item.availability === 'sold');
    if (unavailableItems.length > 0) {
      toast.error('Some items in your cart are no longer available');
      return;
    }

    setShowCheckoutModal(true);
  };

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      
      const response = await apiClient.post('/api/payments/create-checkout-session', {
        items: items.map((item) => ({
          _id: item._id,
          bookTitle: item.bookTitle,
          authorName: item.authorName,
          imageURL: item.imageURL,
          Price: parseFloat(item.Price),
        })),
      });

      const result = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };  const handleCashOnDelivery = async () => {
    if (!address.streetAddress || !address.cityTown || !address.district || !address.contactNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/payments/cash-on-delivery', {
        items,
        address,
        totalAmount: grandTotal,
      });

      if (response.data.success) {
        // Clear cart after successful order
        await fetchCart(); // This will refresh the cart from server (items should be cleared)
        setShowCheckoutModal(false); // Close the modal
        toast.success('Order placed successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl mb-4">Please login to view your cart</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl mb-4">Your cart is empty</p>
            <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card flex gap-4 p-4"
                >
                  <img
                    src={item.imageURL}
                    alt={item.bookTitle}
                    className="w-20 h-28 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.bookTitle}</h3>
                    <p className="text-sm text-muted-foreground">by {item.authorName}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="font-bold text-primary mt-2">
                      {formatCurrency(item.Price)}
                    </p>
                    {item.availability === 'sold' && (
                      <p className="text-sm text-destructive">No longer available</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Shipping available within Bangladesh only
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
              <div className="space-y-4 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-lg border ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                }`}
              >
                <p className="font-medium">Pay with Card</p>
                <p className="text-sm text-muted-foreground">
                  Secure payment via Stripe
                </p>
              </button>

              <button
                onClick={() => setPaymentMethod('cod')}
                className={`w-full p-4 rounded-lg border ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                }`}
              >
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Pay when you receive the book
                </p>
              </button>
            </div>

            {paymentMethod === 'cod' && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Delivery Address</h3>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  className="input w-full"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City/Town"
                    value={address.cityTown}
                    onChange={(e) => setAddress({ ...address, cityTown: e.target.value })}
                    className="input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="District"
                    value={address.district}
                    onChange={(e) => setAddress({ ...address, district: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="input"
                  />
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    value={address.contactNumber}
                    onChange={(e) => setAddress({ ...address, contactNumber: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCheckoutModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>              <Button
                className="flex-1"
                onClick={paymentMethod === 'card' ? handleStripePayment : handleCashOnDelivery}
                disabled={loading || !paymentMethod}
              >
                {getButtonText()}
              </Button>
            </div>
          </motion.div>
        </div>
      )}    </div>
  );
}