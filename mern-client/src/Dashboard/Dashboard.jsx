import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from "../contexts/AuthProvider";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [soldBooks, setSoldBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSoldBooks = async () => {
      try {
        const response = await fetch(`http://localhost:1526/book/email/${user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sold books');
        }
        const data = await response.json();
        setSoldBooks(data.filter(book => book.availability === 'sold'));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.email) {
      fetchSoldBooks();
    }
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  const totalRevenue = soldBooks.reduce((total, book) => total + parseFloat(book.Price), 0);
  const averagePrice = soldBooks.length > 0 ? totalRevenue / soldBooks.length : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 pt-4">Your Sold Books Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Total Books Sold</h2>
          <p className="text-4xl font-bold text-blue-600">{soldBooks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Total Revenue</h2>
          <p className="text-4xl font-bold text-green-600">
            {totalRevenue.toFixed(2)} TK
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Average Price</h2>
          <p className="text-4xl font-bold text-purple-600">
            {averagePrice.toFixed(2)} TK
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-2xl font-semibold p-6 bg-gray-100 text-gray-800">Sold Books List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4">Image</th>
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
              </tr>
            </thead>
            <tbody>
              {soldBooks.map((book, index) => (
                <tr key={book._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4">
                    <img 
                      src={book.imageURL} 
                      alt={book.bookTitle} 
                      className="w-16 h-24 object-cover rounded shadow"
                    />
                  </td>
                  <td className="p-4">{book.bookTitle}</td>
                  <td className="p-4">{book.authorName}</td>
                  <td className="p-4">{book.category}</td>
                  <td className="p-4">{book.Price} TK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;