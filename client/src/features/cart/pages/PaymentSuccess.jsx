import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart, fetchCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(true);
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentMethod = searchParams.get('payment_method');
    
    const processPaymentSuccess = async () => {
      if (sessionId && paymentMethod === 'stripe') {
        try {
          // Complete the Stripe payment on the server
          const response = await apiClient.post('/api/payments/complete-stripe-payment', {
            sessionId
          });

          if (response.data.success) {
            // Clear local cart and refresh from server
            await clearCart();
            await fetchCart();
            
            if (response.data.alreadyProcessed) {
              toast.success('Payment was already processed successfully!');
            } else {
              toast.success('Payment successful! Your books have been purchased.');
            }
          } else {
            toast.error('There was an issue processing your payment. Please contact support.');
          }
        } catch (error) {
          toast.error('Payment completed but there was an issue. Please contact support if needed.');
          // Still clear cart as payment might have succeeded
          await clearCart();
          await fetchCart();
        }
      }
      setIsProcessing(false);
    };

    processPaymentSuccess();
  }, [searchParams, clearCart, fetchCart]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          {isProcessing 
            ? 'Processing your order...' 
            : 'Thank you for your purchase. Your order has been processed successfully.'
          }
        </p>
        {!isProcessing && (
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')}>Go to Home</Button>
            <Button variant="outline" onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}