import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import PropTypes from 'prop-types';
import BookCard from './BookCard';
import { BookGridSkeleton } from '@/components/ui/LoadingComponents';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function BookGrid({ books, loading, view = 'carousel', error = null }) {
  if (loading) {
    // Define container class based on view
    if (view === 'grid') {
      return <BookGridSkeleton count={10} />;
    } else if (view === 'list') {
      return <BookGridSkeleton count={6} listView />;
    }

    // Carousel loading
    return (
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={`skeleton-carousel-${index}`} className="min-w-[240px]">
            <BookGridSkeleton count={1} />
          </div>
        ))}
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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {books.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="space-y-4">
        {books.map((book) => (
          <BookCard key={book._id} book={book} listView />
        ))}
      </div>
    );
  }
  return (
    <Swiper
      slidesPerView={2}
      spaceBetween={12}
      pagination={{ clickable: true }}
      navigation={true}
      modules={[Pagination, Navigation]}
      breakpoints={{
        480: { 
          slidesPerView: 2, 
          spaceBetween: 16 
        },
        640: { 
          slidesPerView: 2, 
          spaceBetween: 20 
        },
        768: { 
          slidesPerView: 3, 
          spaceBetween: 24 
        },
        1024: { 
          slidesPerView: 4, 
          spaceBetween: 24 
        },
        1280: { 
          slidesPerView: 5, 
          spaceBetween: 24 
        },
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

BookGrid.propTypes = {
  books: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    bookTitle: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    imageURL: PropTypes.string.isRequired,
    Price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
  loading: PropTypes.bool,
  view: PropTypes.oneOf(['carousel', 'grid', 'list']),
  error: PropTypes.object,
};