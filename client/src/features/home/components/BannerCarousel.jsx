import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

const bookImages = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
];

export default function BannerCarousel() {
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
        {bookImages.map((image, index) => (
          <SwiperSlide key={index} className="rounded-2xl overflow-hidden">
            <img
              src={image}
              alt={`Book ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}