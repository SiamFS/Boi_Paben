import Banner from '../components/Banner';
import CategoryBooks from '../components/CategoryBooks';
import LatestBooks from '../components/LatestBooks';

export default function Home() {
  return (
    <div className="pt-16">
      <Banner />
      <CategoryBooks />
      <LatestBooks />
    </div>
  );
}