import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import { HiTrash } from 'react-icons/hi';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PiZwnGRR4keZPjYev4QMRdtJjbwUM1oNCJW2ZzJ75kE7lg49NHPsoYn6rxibQ4ERYKROtZp5bRJULLrC20P8UZ500NWNb7Fj3');

const AddToPayment = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [address, setAddress] = useState({
    streetAddress: '',
    cityTown: '',
    district: '',
    zipCode: '',
    contactNumber: ''
  });
  const [addressError, setAddressError] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [checkoutWarning, setCheckoutWarning] = useState(''); // Warning for sold items or empty cart
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
    window.scrollTo(0, 0);
  }, [user]);

  const fetchCartItems = () => {
    fetch(`http://localhost:1526/cart/${user.email}`)
      .then((res) => res.json())
      .then((data) => setCartItems(data))
      .catch((error) => console.error('Error fetching cart items:', error));
  };

  const handleRemoveItem = (id) => {
    fetch(`http://localhost:1526/cart/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCartItems(cartItems.filter((item) => item._id !== id));
        } else {
          console.error('Failed to remove item:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error removing item:', error);
      });
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + parseFloat(item.Price), 0);

  const handleCheckout = () => {
    // Check if cart is empty
    if (cartItems.length === 0) {
      setCheckoutWarning('Your cart is empty. Please add items to proceed.');
      return;
    }

    // Check if any item is sold
    const soldItem = cartItems.find(item => item.availability === 'sold');
    if (soldItem) {
      setCheckoutWarning('Some items in your cart are sold out. Please remove them to proceed.');
      return;
    }

    setCheckoutWarning(''); // Clear warning if no issues
    setIsModalOpen(true);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setAddressError('');
  };

  const handleStripePayment = async () => {
    const stripe = await stripePromise;
  
    try {
      // Ensure prices are properly formatted before sending to server
      const formattedItems = cartItems.map(item => ({
        ...item,
        Price: parseFloat(item.Price).toFixed(2) // Ensures proper decimal format
      }));
  
      const response = await fetch('http://localhost:1526/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: formattedItems,
          email: user.email,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
  
      const session = await response.json();
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
  
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error in Stripe payment:', error);
    }
  };

  const handleCashOnDelivery = async () => {
    // Validate address fields
    if (!address.streetAddress || !address.cityTown || !address.district || !address.zipCode || !address.contactNumber) {
      setAddressError('All address fields are required');
      return;
    }
    setAddressError('');

    const response = await fetch('http://localhost:1526/cash-on-delivery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems,
        email: user.email,
        address: address,
        totalAmount: totalPrice + 50,
        payment: "cod"
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setOrderConfirmed(true);
      // Remove items from cart
      cartItems.forEach(item => handleRemoveItem(item._id));
      setTimeout(() => {
        setOrderConfirmed(false);
        setIsModalOpen(false);
        navigate('/');
      }, 3000);
    } else {
      console.error('Failed to process cash on delivery:', result.message);
      setAddressError(result.message);
    }
  };

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };


  return (
    <div className='pt-28 px-4 lg:px-24'>
      <div className='flex flex-col lg:flex-row'>
        <div className='lg:w-3/4 p-4'>
          {cartItems.length === 0 ? (
            <div className="pl-20 pt-10 text-3xl text-center font-bold text-black">
              No items in the cart.
            </div>
          ) : (
            <div>
              <h2 className='text-3xl lg:text-5xl font-bold mb-4'>My Shopping Cart</h2>
              <div className='flex flex-col space-y-4'>
                {cartItems.map((item) => (
                  <div key={item._id} className='flex items-center border p-2 rounded-lg'>
                    <img src={item.imageURL} alt={item.bookTitle} className='h-20 w-20 object-cover rounded-lg' />
                    <div className='ml-4 flex-grow'>
                      <h5 className='text-lg font-bold text-gray-900'>{item.bookTitle}</h5>
                      <p className='text-sm font-medium text-gray-700'>
                        Author: {item.authorName} <br />
                        Category: {item.category} <br />
                        Price: {item.Price} BDT <br />
                        Availability: {item.availability}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className='bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors'
                    >
                      <HiTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className='lg:w-1/4 p-4 border rounded shadow-lg lg:ml-4'>
          <h2 className='text-3xl lg:text-5xl font-bold mb-4'>Order Summary</h2>
          <p className='text-xl mb-2'>Subtotal: {totalPrice.toFixed(2)} BDT</p>
          <p className='text-xl mb-2'>Shipping: 50.00 BDT</p>
          <p className='text-xl mb-10'>Total: {(totalPrice + 50).toFixed(2)} BDT</p>
          <button
            onClick={handleCheckout}
            className='bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors'
          >
            Proceed to Checkout
          </button>
          {checkoutWarning && (
            <p className='mt-2 text-red-600'>{checkoutWarning}</p>
          )}
          <p className='mt-2 text-sm text-gray-600'>Shipping available within Bangladesh only</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Select Payment Method</h2>
            <div className="flex justify-around mb-4">
              <button
                onClick={() => handlePaymentMethodSelect('card')}
                className={`px-4 py-2 rounded-lg ${paymentMethod === 'card' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
              >
                Pay with Card
              </button>
              <button
                onClick={() => handlePaymentMethodSelect('cash')}
                className={`px-4 py-2 rounded-lg ${paymentMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
              >
                Cash on Delivery
              </button>
            </div>
            {paymentMethod === 'cash' && (
              <div className="mt-4">
                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Street Address"
                  value={address.streetAddress}
                  onChange={handleAddressChange}
                  className="border p-2 rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  name="cityTown"
                  placeholder="City/Town"
                  value={address.cityTown}
                  onChange={handleAddressChange}
                  className="border p-2 rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={address.district}
                  onChange={handleAddressChange}
                  className="border p-2 rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  value={address.zipCode}
                  onChange={handleAddressChange}
                  className="border p-2 rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={address.contactNumber}
                  onChange={handleAddressChange}
                  className="border p-2 rounded-lg w-full mb-2"
                />
                {addressError && <p className="text-red-600">{addressError}</p>}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              {paymentMethod === 'card' ? (
                <button
                  onClick={handleStripePayment}
                  className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  Pay with Card
                </button>
              ) : paymentMethod === 'cash' ? (
                <button
                  onClick={handleCashOnDelivery}
                  className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  Confirm Order
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {orderConfirmed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
            <p className="text-lg">Your order has been successfully placed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToPayment;
