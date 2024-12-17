import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


const SearchBox = () => {
  const { title } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:1526/search/${title}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch search results');
        }
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
        setError('Failed to load search results. Please try again later.');
        setLoading(false);
      });
  }, [title]);

  if (loading) return <div className="text-center my-8">Loading...</div>;
  if (error) return <div className="text-center my-8 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto pt-28 px-4 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          Search results for "{title}"
        </h2>
        {books.length === 0 ? (
          <div className="text-center text-2xl text-gray-600 py-4">
            No results found for "{title}"
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
              >
                <div className="relative aspect-w-3 aspect-h-4 overflow-hidden">
                  {book.imageURL ? (
                    <img
                      src={book.imageURL}
                      alt={book.bookTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">No image available</span>
                    </div>
                  )}
          
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {book.bookTitle.length > 40
                      ? book.bookTitle.substring(0, 40) + '...'
                      : book.bookTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Author: {book.authorName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Category: {book.category}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mb-4">
                    {book.Price} TK
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
