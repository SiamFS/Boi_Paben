import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { prefetchEssentialData } from '@/lib/prefetch';
import router from '@/router/router';

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      prefetchEssentialData(queryClient);
    } catch (error) {
      // Prefetch errors are non-critical
    }
  }, [queryClient]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;