import { bookService } from '@/features/books/services/bookService';

/**
 * Prefetch essential data for the application with error handling
 * @param {QueryClient} queryClient - The React Query client
 */
export const prefetchEssentialData = (queryClient) => {
  try {
    // Check if we already have data in the cache before prefetching
    const latestBooksData = queryClient.getQueryData(['latestBooks']);
    if (!latestBooksData) {
      // Prefetch latest books with low priority
      queryClient.prefetchQuery({
        queryKey: ['latestBooks'],
        queryFn: () => bookService.getAllBooks({ limit: 10 }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false, // Don't retry if it fails on prefetch
      });
    }
  } catch (error) {
    console.warn('Error prefetching latest books:', error);
    // Continue with other prefetching
  }

  try {
    // First category's books - only prefetch if not already in cache
    const firstCategory = 'Fiction'; // First category from bookCategories
    const categoryBooksData = queryClient.getQueryData(['categoryBooks', firstCategory]);
    if (!categoryBooksData) {
      queryClient.prefetchQuery({
        queryKey: ['categoryBooks', firstCategory],
        queryFn: () => bookService.getBooksByCategory(firstCategory),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false, // Don't retry if it fails on prefetch
      });
    }
  } catch (error) {
    console.warn('Error prefetching category books:', error);
    // Silently continue
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
