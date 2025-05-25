import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import BookCard from './BookCard';
import BookCardSkeleton from './BookCardSkeleton';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function BookGrid({ books, loading, view = 'carousel' }) {
  if (loading) {
    return (
      <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' : ''}>
        {view === 'carousel' ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[240px]">
                <BookCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          [...Array(10)].map((_, i) => <BookCardSkeleton key={i} />)
        )}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No books found</p>
      </div>
    );
  }

  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {books.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    );
  }

  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={24}
      pagination={{ clickable: true }}
      navigation={true}
      modules={[Pagination, Navigation]}
      breakpoints={{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
        1280: { slidesPerView: 5 },
      }}
      className="book-carousel"
    >
      {books.map((book) => (
        <SwiperSlide key={book._id}>
          <BookCard book={book} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}