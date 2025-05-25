import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import BannerCarousel from './BannerCarousel';

export default function Banner() {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Buy and Sell Your Books{' '}
              <span className="gradient-text">for the Best Price</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Easily buy and sell your books at unbeatable prices. Find new reads or earn from your
              old ones. Enjoy great value and a vast selection. Join our community and start trading
              today!
            </p>
            <div className="flex gap-4">
              <Link to="/shop">
                <Button size="lg">Browse Books</Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  Sell Your Books
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <BannerCarousel />
          </motion.div>
        </div>
      </div>
    </div>
  );
}