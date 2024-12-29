import React, { useEffect, useState } from 'react'
import BookCards from '../components/BookCards'

const LatestBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:5000/allbooks?sort=createdAt&order=desc&limit=8")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setBooks(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching books:', error);
                setError('Failed to load books. Please try again later.');
                setLoading(false);
            });
    }, [])

    if (loading) return <div className="text-center my-8">Loading...</div>;
    if (error) return <div className="text-center my-8 text-red-500">{error}</div>;

    return (
        <div className="my-16 px-4 lg:px-24">
            <h2 className="text-3xl font-bold text-center mb-8">Latest Books</h2>
            {books.length > 0 ? (
                <BookCards books={books} />
            ) : (
                <p className="text-center">No books available at the moment.</p>
            )}
        </div>
    )
}

export default LatestBooks