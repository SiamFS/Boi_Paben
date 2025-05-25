import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Button } from '@/components/ui/Button';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      clearCart();
    }
  }, [searchParams, clearCart]);

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
          Thank you for your purchase. Your order has been processed successfully.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')}>Go to Home</Button>
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </div>
  );
}