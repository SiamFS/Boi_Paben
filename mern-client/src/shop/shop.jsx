import React, { useEffect, useState } from 'react';
import BookCards from '../components/BookCards'; // Assuming this component is properly styled and reusable
import { HiSortAscending, HiViewList } from 'react-icons/hi';

const Shop = () => {
    const [books, setBooks] = useState([]);
    const [sortOrder, setSortOrder] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                let url = `http://localhost:5000/allbooks?sort=createdAt&order=desc`;
                if (sortOrder) {
                    url = `http://localhost:5000/allbooks?sort=Price&order=${sortOrder}`;
                }
                if (category) {
                    url += `&category=${category}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const data = await response.json();
                setBooks(data.filter((book) => book.availability !== 'sold'));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching books:', error);
                setError('Failed to load books. Please try again later.');
                setLoading(false);
            }
        };

        fetchBooks();
    }, [sortOrder, category]);

    if (loading) return <div className="text-center my-8">Loading...</div>;
    if (error) return <div className="text-center my-8 text-red-500">{error}</div>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto pt-28 px-4 lg:px-8">
                {/* Filter and Sort Controls */}
                <div className="flex flex-col md:flex-row justify-end items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative w-full md:w-auto">
                        <HiSortAscending className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <select
                            onChange={(e) => setSortOrder(e.target.value)}
                            value={sortOrder}
                            className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sort by Price</option>
                            <option value="asc">Price: Low to High</option>
                            <option value="desc">Price: High to Low</option>
                        </select>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <HiViewList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <select
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                            className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="Science Fiction">Science Fiction</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Horror">Horror</option>
                            <option value="Romance">Romance</option>
                            <option value="Thriller">Thriller</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Children">Children</option>
                            <option value="Education">Education</option>
                            <option value="Biography">Biography</option>
                        </select>
                    </div>
                </div>

                {/* Book Cards */}
                {books.length > 0 ? (
                    <BookCards books={books} />
                ) : (
                    <div className="text-center text-2xl font-semibold text-red-600">
                        No books found in the selected category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
