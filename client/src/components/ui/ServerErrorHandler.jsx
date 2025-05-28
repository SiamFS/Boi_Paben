import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const ErrorContent = ({ 
  isServerInactive, 
  countdown, 
  retryCount, 
  maxRetries, 
  handleRetry, 
  isRetrying 
}) => {
  const getButtonContent = () => {
    if (isRetrying) {
      return (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Retrying...
        </>
      );
    }
    
    if (countdown > 0) {
      return <>Retry in {countdown}s</>;
    }
    
    return (
      <>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        {isServerInactive ? (
          <div className="relative">
            <WifiOff className="h-16 w-16 text-yellow-500" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <RefreshCw className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </div>
        ) : (
          <AlertTriangle className="h-16 w-16 text-destructive" />
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold">
          {isServerInactive ? 'Server Starting Up' : 'Connection Error'}
        </h3>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {isServerInactive ? (
            <>
              Our server is waking up from sleep mode. This usually takes 30-60 seconds for the first request.
              {countdown > 0 && (
                <span className="block mt-2 font-medium text-primary">
                  Retrying in {countdown}s...
                </span>
              )}
            </>
          ) : (
            'Something went wrong while connecting to the server. Please check your internet connection and try again.'
          )}
        </p>

        {retryCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Attempt {retryCount} of {maxRetries}
          </p>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleRetry}
          disabled={isRetrying || countdown > 0}
          className="min-w-[120px]"
        >
          {getButtonContent()}
        </Button>
        
        {!isServerInactive && (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        )}
      </div>

      {isServerInactive && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-2">
            <Wifi className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Why does this happen?</p>
              <p>Free hosting services like Render put inactive servers to sleep to save resources. The server needs a moment to wake up when receiving the first request after a period of inactivity.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

ErrorContent.propTypes = {
  isServerInactive: PropTypes.bool.isRequired,
  countdown: PropTypes.number.isRequired,
  retryCount: PropTypes.number.isRequired,
  maxRetries: PropTypes.number.isRequired,
  handleRetry: PropTypes.func.isRequired,
  isRetrying: PropTypes.bool.isRequired,
};

export default function ServerErrorHandler({ 
  error, 
  onRetry, 
  retryCount = 0, 
  maxRetries = 3,
  showAsModal = false 
}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check if the error is likely due to server being inactive (common with Render)
  const isServerInactive = error?.code === 'NETWORK_ERROR' || 
                           error?.message?.includes('fetch') ||
                           error?.message?.includes('Failed to fetch') ||
                           error?.status === 503 ||
                           error?.status === 502;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  // Auto-retry with countdown for server inactive errors
  useEffect(() => {
    if (isServerInactive && retryCount < maxRetries) {
      const retryDelay = Math.min(5000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
      setCountdown(Math.ceil(retryDelay / 1000));
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [error, retryCount, maxRetries, isServerInactive]);

  if (showAsModal) {
    return (
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-card rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <ErrorContent 
                isServerInactive={isServerInactive}
                countdown={countdown}
                retryCount={retryCount}
                maxRetries={maxRetries}
                handleRetry={handleRetry}
                isRetrying={isRetrying}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <ErrorContent 
          isServerInactive={isServerInactive}
          countdown={countdown}
          retryCount={retryCount}
          maxRetries={maxRetries}
          handleRetry={handleRetry}
          isRetrying={isRetrying}
        />
      </div>
    </div>
  );
}

ServerErrorHandler.propTypes = {
  error: PropTypes.object,
  onRetry: PropTypes.func.isRequired,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  showAsModal: PropTypes.bool,
};
