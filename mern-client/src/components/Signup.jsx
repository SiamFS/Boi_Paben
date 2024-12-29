import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import { FaBookOpen } from 'react-icons/fa';

const Signup = () => {
  const { createUser, signInWithGoogle } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const firstName = form.firstName.value;
    const lastName = form.lastName.value;

    try {
      const result = await createUser(email, password, firstName, lastName);
      setSuccess(result.message || "Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 500); // Reduced timeout for faster navigation
    } catch (err) {
      setError(err.message || "Failed to sign up. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      setSuccess("Signup with Google successful!");
      setTimeout(() => {
        navigate('/');
      }, 500); // Reduced timeout
    } catch (err) {
      setError(err.message || "Google signup failed. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-orange-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <Link to='/' className="text-2xl font-bold text-orange-400 flex items-center gap-2 transition-colors duration-200 hover:text-orange-500">
                <FaBookOpen className='inline-block' /> Cover Book
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Sign Up Form</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <form onSubmit={handleSignup} className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="relative">
                  <input 
                    id="firstName" 
                    name="firstName" 
                    type="text" 
                    className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600 transition-colors duration-200" 
                    placeholder="First Name" 
                    required 
                  />
                </div>
                <div className="relative">
                  <input 
                    id="lastName" 
                    name="lastName" 
                    type="text" 
                    className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600 transition-colors duration-200" 
                    placeholder="Last Name" 
                    required 
                  />
                </div>
                <div className="relative">
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600 transition-colors duration-200" 
                    placeholder="Email address" 
                    required 
                  />
                </div>
                <div className="relative">
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600 transition-colors duration-200" 
                    placeholder="Password" 
                    required 
                  />
                </div>
                <p>
                  If you have an account, please{" "}
                  <Link to='/login' className='text-orange-400 hover:text-orange-500 transition-colors duration-200'>
                    Login
                  </Link>{" "}
                  here.
                </p>
                <div className="relative">
                  <button 
                    type="submit" 
                    className={`bg-orange-400 text-white rounded-md px-4 py-2 hover:bg-orange-500 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Signing up...' : 'Sign up'}
                  </button>
                </div>
                {error && (
                  <div className="text-red-500 bg-red-50 p-3 rounded-md transition-all duration-200">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-green-500 bg-green-50 p-3 rounded-md transition-all duration-200">
                    {success}
                  </div>
                )}
              </form>
              <div className="flex flex-col items-center mt-6">
                <h1 className="font-bold text-black mb-4">Sign up with Google</h1>
                <button 
                  onClick={handleGoogleSignup} 
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  <img 
                    src="https://img.icons8.com/color/48/000000/google-logo.png"
                    alt="Sign up with Google" 
                    className="w-10 h-10"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;