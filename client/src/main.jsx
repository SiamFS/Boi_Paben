import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { warmupBackend } from './lib/backend-warmup';

// Start backend warmup immediately (non-blocking)
warmupBackend();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - shorter for fresher data
      gcTime: 30 * 60 * 1000, // 30 minutes (replaces deprecated cacheTime)
      retry: 1,
      refetchOnWindowFocus: true, // Refresh when user returns to tab
      refetchOnMount: true, // Always fetch fresh data on mount
      refetchOnReconnect: 'always',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            marginTop: '80px', // Account for navbar height
          },
          success: {
            style: {
              background: '#10b981',
              marginTop: '80px',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              marginTop: '80px',
            },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);