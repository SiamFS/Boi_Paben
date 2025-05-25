import { useState, useEffect } from 'react';

export default function SimpleBanner() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching books from API...');
        const response = await fetch('http://localhost:5000/api/books/latest?limit=3');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Data:', data);
        
        if (data.success && data.books) {
          setBooks(data.books);
        } else {
          setError('No books found');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-100 p-8 text-center">
        <h2 className="text-2xl font-bold">Loading Banner...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="bg-green-100 p-8">
      <h2 className="text-2xl font-bold mb-4">Simple Banner - Books Loaded!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map((book, index) => (
          <div key={book._id} className="bg-white p-4 rounded shadow">
            <img 
              src={book.coverImage || book.imageURL || '/placeholder-book.jpg'} 
              alt={book.title} 
              className="w-full h-48 object-cover mb-2"
              onError={(e) => {
                console.log('Image error for:', book.title, 'URL:', e.target.src);
                e.target.src = '/placeholder-book.jpg';
              }}
            />
            <h3 className="font-bold">{book.title}</h3>
            <p className="text-sm text-gray-600">{book.author}</p>
            <p className="text-lg font-bold text-green-600">৳{book.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
