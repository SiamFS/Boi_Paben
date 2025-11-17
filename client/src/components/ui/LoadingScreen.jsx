import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-4"
      >
        {/* Logo matching Navbar */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center gap-2"
        >
          <BookOpen className="h-16 w-16 text-primary" />
          <span className="text-4xl font-bold text-primary">BoiPaben</span>
        </motion.div>

        {/* Loading spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex justify-center"
        >
          <div className="h-8 w-8 border-3 border-primary/30 border-t-primary rounded-full" />
        </motion.div>

        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-muted-foreground"
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}