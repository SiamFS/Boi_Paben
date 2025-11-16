import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import recommendationService from '@/services/recommendationService';
import 'swiper/css';
import 'swiper/css/effect-cards';

const fallbackImages = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
];

export default function BannerCarousel() {
  const { user } = useAuth();
  const { data: bannerBooks = [], isLoading } = useQuery({
    queryKey: ['bannerBooks', user?.uid],
    queryFn: () => recommendationService.getBannerBooks(5),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // Use gcTime instead of deprecated cacheTime
    retry: false, // Don't retry on failure
    suspense: false, // Don't use suspense boundary
    enabled: true, // Always enabled
  });

  // Backend already filters sold books, no filtering needed here
  const displayBooks = bannerBooks.length > 0 ? bannerBooks : [];

  if (isLoading) {
    return (
      <div className="w-60 h-80 flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-2xl w-full h-full" />
      </div>
    );
  }

  // Don't show carousel if no books available
  if (displayBooks.length === 0) {
    return null;
  }

  return (
    <div className="w-60 h-80">
      <Swiper
        effect="cards"
        grabCursor={true}
        modules={[EffectCards, Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="w-full h-full"
      >
        {displayBooks.map((book) => (
          <SwiperSlide key={book._id} className="rounded-2xl overflow-hidden">
            <Link to={`/book/${book._id}`} className="block w-full h-full">
              <img
                src={book.imageURL}
                alt={book.bookTitle}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = fallbackImages[0];
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-2">
                  {book.bookTitle}
                </h3>
                <p className="text-white/80 text-xs">
                  by {book.authorName}
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}