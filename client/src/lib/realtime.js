// Real-time data synchronization using polling with exponential backoff
import { QueryClient } from '@tanstack/react-query';

let pollIntervals = {};

/**
 * Start polling a query to keep it fresh
 * @param {QueryClient} queryClient - TanStack QueryClient instance
 * @param {string|array} queryKey - Query key to poll
 * @param {function} queryFn - Function to refetch data
 * @param {number} interval - Poll interval in milliseconds (default: 30000 = 30 seconds)
 */
export const startPolling = (queryClient, queryKey, queryFn, interval = 30000) => {
  const key = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;
  
  // Clear existing poll if any
  if (pollIntervals[key]) {
    clearInterval(pollIntervals[key]);
  }

  // Start polling
  pollIntervals[key] = setInterval(() => {
    queryClient.invalidateQueries({ queryKey });
  }, interval);

  return () => stopPolling(key);
};

/**
 * Stop polling a query
 * @param {string|array} queryKey - Query key to stop polling
 */
export const stopPolling = (queryKey) => {
  const key = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;
  if (pollIntervals[key]) {
    clearInterval(pollIntervals[key]);
    delete pollIntervals[key];
  }
};

/**
 * Stop all active polls
 */
export const stopAllPolling = () => {
  Object.keys(pollIntervals).forEach(key => {
    clearInterval(pollIntervals[key]);
  });
  pollIntervals = {};
};

export default {
  startPolling,
  stopPolling,
  stopAllPolling,
};
