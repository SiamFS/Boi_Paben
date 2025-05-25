import SimpleBanner from '@/components/home/SimpleBanner';
import CategoryBooks from '../components/CategoryBooks';
import LatestBooks from '../components/LatestBooks';

export default function Home() {
  return (
    <div className="pt-16">
      <SimpleBanner />
      <CategoryBooks />
      <LatestBooks />
    </div>
  );
}