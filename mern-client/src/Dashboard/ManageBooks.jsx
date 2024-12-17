import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';

const ManageBooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    const fetchBooks = async () => {
      try {
        const response = await fetch(`http://localhost:1526/book/email/${user.email}`);
        const data = await response.json();
        const availableBooks = data.filter(book => book.availability !== "sold");
        setAllBooks(availableBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:1526/book/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setAllBooks((prevBooks) => prevBooks.filter(book => book._id !== id)); 
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div className='container mx-auto px-4 my-12'>
      <h2 className="mb-8 text-3xl font-bold text-center">Manage Books</h2>
      
      {/* Table for large screens */}
      <div className='hidden md:block overflow-x-auto'>
        <table className='table-auto min-w-full bg-white'>
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">No.</th>
              <th className="py-2 px-4 border-b">Image</th>
              <th className="py-2 px-4 border-b">Book Name</th>
              <th className="py-2 px-4 border-b">Author Name</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Edit or Manage</th>
            </tr>
          </thead>
          <tbody>
            {allBooks.map((book, index) => (
              <tr key={book._id} className="text-center">
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="p-4 border-b">{book.imageURL && <img src={book.imageURL} alt={book.bookTitle} className="h-22 w-16 object-cover mx-auto" />}</td>
                <td className="py-2 px-4 border-b whitespace-nowrap text-ellipsis overflow-hidden max-w-[150px]">{book.bookTitle}</td>
                <td className="py-2 px-4 border-b">{book.authorName}</td>
                <td className="py-2 px-4 border-b">{book.category}</td>
                <td className="py-2 px-4 border-b">{book.Price}</td>
                <td className="py-2 px-4 border-b">
                  <Link
                    to={`/dashboard/edit/${book._id}`}
                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 mr-5">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(book._id)}
                    className='bg-red-600 px-4 py-1 font-semibold text-white rounded-sm hover:bg-red-700'>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards for small screens */}
      <div className='block md:hidden'>
        {allBooks.map((book, index) => (
          <div key={book._id} className="mb-4 p-4 border rounded-lg bg-white shadow-md">
            <p className="font-bold mb-2">No.: {index + 1}</p>
            <p className="font-bold mb-2">Book Name: <span className="font-normal">{book.bookTitle}</span></p>
            <p className="font-bold mb-2">Author Name: <span className="font-normal">{book.authorName}</span></p>
            <p className="font-bold mb-2">Category: <span className="font-normal">{book.category}</span></p>
            <p className="font-bold mb-2">Price: <span className="font-normal">{book.Price}</span></p>
            <div className="flex justify-between mt-2">
              <Link
                to={`/dashboard/edit-books/${book._id}`}
                className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                Edit
              </Link>
              <button onClick={() => handleDelete(book._id)}
                className='bg-red-600 px-4 py-1 font-semibold text-white rounded-sm hover:bg-red-700'>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageBooks;