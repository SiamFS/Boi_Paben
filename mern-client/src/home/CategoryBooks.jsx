import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCards from '../components/BookCards';

const categories = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery",
  "Horror", "Romance", "Thriller", "Adventure", "Children",
  "Education", "Biography"
];

const CategoryBooks = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/books/category/${selectedCategory}`)
      .then(res => res.json())
      .then(data => setBooks(data.slice(0, 90)))
      .catch(error => console.error('Error fetching books:', error));
  }, [selectedCategory]);

  return (
    <div className="my-16 px-4 lg:px-24">
      <h2 className="text-3xl font-bold text-center mb-8">Browse by Category</h2>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedCategory === category
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <h2 className="text-3xl font-semibold text-center pt-8">{selectedCategory} Books</h2>
      <BookCards books={books} />
      <div className="text-center mt-12">
        <Link to="/shop" className="inline-block px-6 py-3 bg-orange-400 text-white font-semibold rounded-full hover:bg-orange-500 transition-colors shadow-md hover:shadow-lg">
          View All Books
        </Link>
      </div>
    </div>
  );
};

export default CategoryBooks;