import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes instead of 1 minute
      cacheTime: 30 * 60 * 1000, // 30 minutes instead of 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on component mount if data is stale
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