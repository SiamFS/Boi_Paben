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
          {isServerInactive ? 'Backend Server Starting' : 'Connection Error'}
        </h3>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {isServerInactive ? (
            <>
              <span className="block font-medium text-foreground mb-2">
                Backend hosted on Render (Free Tier)
              </span>
              The server is starting up from sleep mode. This typically takes <strong>1-2 minutes</strong> for the first request.
              {countdown > 0 && (
                <span className="block mt-3 font-semibold text-primary text-lg">
                  Auto-retrying in {countdown}s...
                </span>
              )}
            </>
          ) : (
            'Unable to connect to the server. Please check your internet connection and try again.'
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-3">
            <Wifi className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-900 dark:text-blue-200 text-left">
              <p className="font-semibold mb-2">📌 Professional Note for Recruiters:</p>
              <p className="mb-2">This project uses <strong>Render's free hosting tier</strong> for the backend API. Free tier servers automatically sleep after 15 minutes of inactivity to conserve resources.</p>
              <p className="text-xs opacity-90">⏱️ First request after inactivity: ~50-120 seconds startup time</p>
              <p className="text-xs opacity-90">⚡ Subsequent requests: Instant response</p>
              <p className="text-xs opacity-90 mt-2">💡 In production, paid hosting ensures 24/7 availability with zero cold starts.</p>
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
      // Longer delays for Render cold starts: 15s, 30s, 45s
      const retryDelay = retryCount === 0 ? 15000 : Math.min(15000 * (retryCount + 1), 60000);
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
