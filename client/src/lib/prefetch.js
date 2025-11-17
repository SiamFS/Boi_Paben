import { bookService } from '@/features/books/services/bookService';

/**
 * Prefetch essential data for the application with error handling
 * @param {QueryClient} queryClient - The React Query client
 */
export const prefetchEssentialData = (queryClient) => {
  try {
    // Prefetch latest books - uses dedicated /latest endpoint
    const latestBooksData = queryClient.getQueryData(['latestBooks']);
    if (!latestBooksData) {
      queryClient.prefetchQuery({
        queryKey: ['latestBooks'],
        queryFn: () => bookService.getLatestBooks(10),
        staleTime: 5 * 60 * 1000,
        retry: false,
      });
    }
  } catch (error) {
    console.warn('Error prefetching latest books:', error);
  }

  try {
    // Prefetch first category - 'Fiction'
    const categoryBooksData = queryClient.getQueryData(['categoryBooks', 'Fiction']);
    if (!categoryBooksData) {
      queryClient.prefetchQuery({
        queryKey: ['categoryBooks', 'Fiction'],
        queryFn: () => bookService.getBooksByCategory('Fiction'),
        staleTime: 5 * 60 * 1000,
        retry: false,
      });
    }
  } catch (error) {
    console.warn('Error prefetching category books:', error);
  }
};

/**
 * Detect network conditions and adjust fetch behavior
 * @returns {Object} Network condition info
 */
export const detectNetworkConditions = async () => {
  try {
    const startTime = performance.now();
    await fetch('/api/ping', { 
      method: 'HEAD',
      cache: 'no-cache',
    });
    const endTime = performance.now();
    const networkLatency = endTime - startTime;
    
    // Get connection info if available
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
                      
    const effectiveType = connection ? connection.effectiveType : null;
    const saveData = connection ? connection.saveData : false;
    
    return {
      latency: networkLatency,
      effectiveType,
      saveData,
      isSlowConnection: networkLatency > 500 || 
                        effectiveType === '2g' || 
                        effectiveType === 'slow-2g'
    };
  } catch (error) {
    console.warn('Could not detect network conditions:', error);
    return { isSlowConnection: false, saveData: false };
  }
};
