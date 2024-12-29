import React, { useState, useContext, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import { HiShoppingCart, HiExclamationCircle } from 'react-icons/hi';

const SingleBook = () => {
  const navigate = useNavigate();
  const {
    _id,
    bookTitle,
    authorName,
    imageURL,
    Price,
    bookDescription,
    category,
    authenticity,
    productCondition,
    publisher,
    edition,
    availability,
    seller,
    email,
  } = useLoaderData();

  const { user } = useContext(AuthContext);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowReportModal(false);
    }

    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Check if the book is in the user's cart
    if (user) {
      fetch(`http://localhost:5000/cart/${user.email}`)
        .then(res => res.json())
        .then(data => {
          setInCart(data.some(item => item.original_id === _id));
        })
        .catch(error => console.error('Error fetching user cart:', error));
    }
  }, [user, _id]);

  const handleReport = async () => {
    if (!reportReason) {
      setReportMessage('Please select a reason for reporting.');
      return;
    }

    const reportData = {
      bookId: _id,
      bookTitle,
      sellerName: seller,
      sellerEmail: email,
      reporterEmail: user.email,
      reporterName: user.displayName,
      reason: reportReason,
    };

    try {
      const response = await fetch('http://localhost:5000/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (result.success) {
        setReportMessage('Report submitted successfully.');
        setTimeout(() => {
          setShowReportModal(false);
          setReportMessage('');
        }, 2000);
      } else if (result.message === 'Already reported') {
        setReportMessage('You have already reported this book.');
      } else {
        setReportMessage('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setReportMessage('An error occurred. Please try again.');
    }
  };

  const handleReportClick = () => {
    if (user) {
      setShowReportModal(true);
    } else {
      alert('Please log in to report this book.');
    }
  };

  const addToCart = () => {
    if (user) {
      if (inCart) {
        alert('This book is already in your cart.');
        return;
      }

      const cartItem = {
        original_id: _id,
        bookTitle,
        authorName,
        imageURL,
        Price,
        category,
        user_email: user.email,
      };

      fetch('http://localhost:5000/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItem),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInCart(true);
          } else {
            alert(data.message || 'Failed to add book to cart');
          }
        })
        .catch((error) => {
          console.error('Error adding to cart:', error);
          alert('An error occurred while adding the book to cart');
        });
    } else {
      alert('You need to be logged in to add items to the cart');
    }
  };

  return (
    <div className="flex min-h-screen pt-[80px] md:pt-[40px] bg-gray-100 flex-grow mt-[100px] md:mt-[80px]">
      <div className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="md:flex md:items-start">
              <div className="md:flex-shrink-0 md:w-1/3">
                <img className="w-full object-cover" src={imageURL} alt={bookTitle} />
                <div className="p-4 space-y-3 flex flex-col items-center">
                  {user && email === user.email ? (
                    <button
                      className="w-1/2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                      disabled
                    >
                      <HiShoppingCart className="mr-2 size-4" />
                      Your Book
                    </button>
                  ) : (
                    <button
                      onClick={addToCart}
                      className={`w-1/2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        inCart ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                      disabled={inCart}
                    >
                      <HiShoppingCart className="mr-2 size-4" />
                      {inCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                  )}
                  <button
                    onClick={handleReportClick}
                    className="w-1/2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <HiExclamationCircle className="mr-2 size-4" />
                    Report this Book
                  </button>
                </div>
              </div>
              <div className="p-8 md:w-2/3">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                  {availability}
                </div>
                <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  {bookTitle}
                </h2>
                <p className="mt-2 text-lg text-gray-500">Author: {authorName}</p>
                <p className="mt-2 text-lg text-gray-500">Category: {category}</p>
                <p className="mt-4 text-xl text-gray-900">Price: {Price} Tk</p>
                <p className="mt-2 text-gray-500">Seller: {seller}</p>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {authenticity && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Authenticity</dt>
                        <dd className="mt-1 text-sm text-gray-900">{authenticity}</dd>
                      </div>
                    )}
                    {productCondition && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Condition</dt>
                        <dd className="mt-1 text-sm text-gray-900">{productCondition}</dd>
                      </div>
                    )}
                    {publisher && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Publisher</dt>
                        <dd className="mt-1 text-sm text-gray-900">{publisher}</dd>
                      </div>
                    )}
                    {edition && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Edition</dt>
                        <dd className="mt-1 text-sm text-gray-900">{edition}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="mt-6 text-gray-500">
                  <p>Book Description</p>
                  <p className="mt-2 text-lg text-gray-900">{bookDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center overflow-hidden">
          <div className="bg-white p-5 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Why do you want to report this post?</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Select a reason</option>
              <option value="Unauthorized sales">Unauthorized sales</option>
              <option value="False Information">False Information</option>
              <option value="Spam">Spam</option>
              <option value="Hate Speech">Hate Speech</option>
              <option value="Terrorism">Terrorism</option>
              <option value="Violence">Violence</option>
              <option value="Harassment">Harassment</option>
              <option value="Something Else">Something Else</option>
            </select>
            {reportMessage && <p className="text-red-500 mb-4">{reportMessage}</p>}
            <div className="flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleBook;