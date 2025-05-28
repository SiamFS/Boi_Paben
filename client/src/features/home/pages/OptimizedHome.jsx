import { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import Banner from '../components/Banner';

// Lazy load non-critical sections
const CategoryBooks = lazy(() => import('../components/CategoryBooks'));
const LatestBooks = lazy(() => import('../components/LatestBooks'));

// Simple loading fallback that doesn't depend on other components
const LoadingFallback = ({ className }) => (
  <div className={`animate-pulse bg-muted rounded ${className || "h-64 w-full"}`} />
);

LoadingFallback.propTypes = {
  className: PropTypes.string,
};

export default function OptimizedHome() {
  return (
    <div className="pt-16">
      {/* Critical content loaded immediately */}
      <Banner />
      
      {/* Non-critical content lazy loaded */}
      <Suspense fallback={<div className="py-16"><LoadingFallback /></div>}>
        <CategoryBooks />
      </Suspense>
      
      <Suspense fallback={<div className="py-16 bg-muted/50"><LoadingFallback /></div>}>
        <LatestBooks />
      </Suspense>
    </div>
  );
}
