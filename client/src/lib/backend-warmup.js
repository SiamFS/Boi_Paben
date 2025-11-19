/**
 * Backend Warmup Service
 * Pings the Render backend on app startup to wake it from sleep
 * This reduces perceived loading time for users
 */

const API_URL = import.meta.env.VITE_API_URL_PRODUCTION || 'https://boi-paben-backend.onrender.com';
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isProduction = !isLocalhost;

let warmupAttempted = false;
let warmupSuccessful = false;

/**
 * Ping the backend server to wake it up
 * Uses a lightweight endpoint with extended timeout
 * Retries up to 3 times if needed
 */
export const warmupBackend = async () => {
  // Only warmup in production and only once per session
  if (!isProduction || warmupAttempted) {
    return;
  }

  warmupAttempted = true;

  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts && !warmupSuccessful) {
    attempt++;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout per attempt

      const response = await fetch(`${API_URL}/api/books/latest?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        warmupSuccessful = true;
        break;
      } else {
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s before retry
        }
      }
    } catch (error) {
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15s after error
      }
    }
  }

  // If warmup unsuccessful, requests will continue with extended timeouts
};

/**
 * Check if backend warmup was successful
 */
export const isBackendReady = () => warmupSuccessful;

/**
 * Get warmup status
 */
export const getWarmupStatus = () => ({
  attempted: warmupAttempted,
  successful: warmupSuccessful,
});
