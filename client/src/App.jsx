import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import LoadingScreen from '@/components/ui/LoadingScreen';
import PrivateRoute from '@/features/auth/components/PrivateRoute';
import Layout from '@/components/layout/Layout';
import DashboardLayout from '@/features/dashboard/components/DashboardLayout';
import { prefetchEssentialData } from '@/lib/prefetch';

const Home = lazy(() => import('@/features/home/pages/Home'));
const Shop = lazy(() => import('@/features/books/pages/Shop'));
const BookDetail = lazy(() => import('@/features/books/pages/BookDetail'));
const Cart = lazy(() => import('@/features/cart/pages/Cart'));
const Blog = lazy(() => import('@/features/blog/pages/Blog'));
const About = lazy(() => import('@/pages/About'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const Signup = lazy(() => import('@/features/auth/pages/Signup'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const UploadBook = lazy(() => import('@/features/dashboard/pages/UploadBook'));
const ManageBooks = lazy(() => import('@/features/dashboard/pages/ManageBooks'));
const EditBook = lazy(() => import('@/features/dashboard/pages/EditBook'));
const Search = lazy(() => import('@/features/books/pages/Search'));
const PaymentSuccess = lazy(() => import('@/features/cart/pages/PaymentSuccess'));

function App() {
  const queryClient = useQueryClient();

  // Prefetch essential data after initial render with error handling
  useEffect(() => {
    // Use a small delay to prioritize rendering the initial UI first
    const timer = setTimeout(() => {
      try {
        // Safe prefetching with error handling
        prefetchEssentialData(queryClient);
      } catch (error) {
        console.error("Error prefetching data:", error);
        // Continue app execution even if prefetching fails
      }
    }, 1500); // Slightly longer delay for more reliable initial rendering
    
    return () => clearTimeout(timer);
  }, [queryClient]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="book/:id" element={<BookDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="blog" element={<Blog />} />
                <Route path="about" element={<About />} />
                <Route path="search/:query" element={<Search />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
              </Route>
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="upload" element={<UploadBook />} />
                <Route path="manage" element={<ManageBooks />} />
                <Route path="edit/:id" element={<EditBook />} />
              </Route>
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;