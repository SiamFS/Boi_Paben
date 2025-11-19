import { motion } from 'framer-motion';
import { BookOpen, Loader2, Wifi, WifiOff } from 'lucide-react';
import PropTypes from 'prop-types';
import { Button } from './Button';

// Generic skeleton component for reuse
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

Skeleton.propTypes = {
  className: PropTypes.string
};

const SkeletonLoader = ({ className = "" }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

SkeletonLoader.propTypes = {
  className: PropTypes.string
};

const PulseAnimation = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0.5, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      delay,
    }}
  >
    {children}
  </motion.div>
);

PulseAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number
};

// Grid skeleton for book cards
export const BookGridSkeleton = ({ count = 8, listView = false }) => {
  if (listView) {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }, (_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            <div className="card flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-5 h-full overflow-hidden bg-gradient-to-r from-card/50 to-card border border-border/50">
              <div className="flex gap-3 sm:contents">
                <div className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 bg-muted/50 rounded-xl">
                  <div className="w-full h-full bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 animate-pulse rounded-xl" />
                </div>

                <div className="flex-grow flex flex-col justify-between min-w-0">
                  <div className="flex-grow space-y-1.5 sm:space-y-2">
                    <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-full" />
                    <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-3/4" />
                    <div className="h-3 sm:h-4 bg-muted/60 rounded animate-pulse w-2/3" />
                    <div className="h-5 bg-muted/60 rounded-full animate-pulse w-20" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 sm:hidden">
                    <div className="h-5 bg-muted/60 rounded animate-pulse w-24" />
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex sm:flex-col sm:justify-between sm:min-w-0 sm:flex-grow">
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-full" />
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-5/6" />
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                  <div className="h-7 bg-muted/60 rounded animate-pulse w-24" />
                  <div className="flex gap-2">
                    <div className="h-9 bg-muted/60 rounded animate-pulse w-20" />
                    <div className="h-9 bg-muted/60 rounded animate-pulse w-16" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:hidden">
                <div className="flex-1 h-8 bg-muted/60 rounded animate-pulse" />
                <div className="flex-1 h-8 bg-muted/60 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.6, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative h-full flex flex-col overflow-hidden bg-gradient-to-br from-card via-card to-card/80 border border-border/50 rounded-xl shadow-sm"
        >
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-muted/30 rounded-t-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 animate-pulse" />
          </div>
          
          {/* Content Container */}
          <div className="p-3 sm:p-4 flex-grow flex flex-col bg-gradient-to-b from-card to-card/50">
            <div className="flex-grow space-y-1 sm:space-y-2">
              {/* Title - 2 lines */}
              <div className="space-y-1.5">
                <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-full" />
                <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-4/5" />
              </div>
              {/* Author */}
              <div className="h-3 sm:h-4 bg-muted/60 rounded animate-pulse w-3/5 mt-1" />
              {/* Category badge */}
              <div className="inline-block mt-1">
                <div className="h-5 sm:h-6 bg-muted/60 rounded-full animate-pulse w-20" />
              </div>
            </div>
            
            {/* Bottom section */}
            <div className="mt-auto space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                {/* Price */}
                <div className="h-5 sm:h-6 bg-muted/60 rounded animate-pulse w-24" />
                {/* Cart button */}
                <div className="h-8 sm:h-10 w-8 sm:w-10 bg-muted/60 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Content loading skeleton
export const ContentLoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6 animate-pulse"
  >
    <div className="space-y-2">
      <SkeletonLoader className="h-8 w-1/3" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-2/3" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonLoader className="h-32" />
      <SkeletonLoader className="h-32" />
    </div>
    
    <div className="space-y-3">
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-3/4" />
    </div>
  </motion.div>
);

// Table loading skeleton
export const TableLoadingSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="w-full animate-pulse">
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, index) => (
            <SkeletonLoader key={index} className="h-4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="border-b last:border-b-0 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <SkeletonLoader key={colIndex} className="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form loading skeleton
export const FormLoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6 animate-pulse"
  >
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="space-y-2">
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-10 w-full" />
      </div>
    ))}
    
    <div className="flex gap-4">
      <SkeletonLoader className="h-10 w-24" />
      <SkeletonLoader className="h-10 w-24" />
    </div>
  </motion.div>
);

// Stats cards skeleton
export const StatsLoadingSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <SkeletonLoader className="h-6 w-20" />
          <SkeletonLoader className="h-10 w-10 rounded-lg" />
        </div>
        <SkeletonLoader className="h-8 w-16 mb-2" />
        <SkeletonLoader className="h-4 w-24" />
      </motion.div>
    ))}
  </div>
);

// Compact loading spinner
export const LoadingSpinner = ({ size = "default", text = "" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
};

// Enhanced spinner for critical loading states
export const SmartLoadingSpinner = ({ 
  size = "default", 
  text = "", 
  variant = "primary",
  showProgress = false,
  progress = 0 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const variantClasses = {
    primary: "text-primary",
    secondary: "text-muted-foreground",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500"
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Loader2 
          className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin`} 
        />
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
      {text && (
        <p className={`text-sm ${variantClasses[variant]} animate-pulse`}>
          {text}
        </p>
      )}
      {showProgress && (
        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${variantClasses[variant].replace('text-', 'bg-')}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
};

// Server connection status indicator
export const ServerStatusIndicator = ({ isConnected, isReconnecting, onRetry }) => {
  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="h-4 w-4" />;
    if (isReconnecting) return <Loader2 className="h-4 w-4 animate-spin" />;
    return <WifiOff className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (isReconnecting) return 'Reconnecting...';
    return 'Connection Lost';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg border ${
        isConnected 
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
        
        {!isConnected && !isReconnecting && onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="ml-2 h-6 px-2 text-xs"
          >
            Retry
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Props validation
SkeletonLoader.propTypes = {
  className: PropTypes.string,
};

PulseAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

BookGridSkeleton.propTypes = {
  count: PropTypes.number,
  listView: PropTypes.bool,
};

TableLoadingSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};

StatsLoadingSkeleton.propTypes = {
  count: PropTypes.number,
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  text: PropTypes.string,
};

SmartLoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'xl']),
  text: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger']),
  showProgress: PropTypes.bool,
  progress: PropTypes.number,
};

ServerStatusIndicator.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  isReconnecting: PropTypes.bool,
  onRetry: PropTypes.func,
};
