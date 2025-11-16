import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import Layout from '@/components/layout/Layout';
import DashboardLayout from '@/features/dashboard/components/DashboardLayout';
import PrivateRoute from '@/features/auth/components/PrivateRoute';

// Lazy load all pages
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

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'shop',
        element: <Shop />,
      },
      {
        path: 'book/:id',
        element: <BookDetail />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'blog',
        element: <Blog />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'search/:query',
        element: <Search />,
      },
      {
        path: 'payment-success',
        element: <PaymentSuccess />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'upload',
        element: <UploadBook />,
      },
      {
        path: 'manage',
        element: <ManageBooks />,
      },
      {
        path: 'edit/:id',
        element: <EditBook />,
      },
    ],
  },  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
], 
{
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default router;