import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import { FaBookOpen } from 'react-icons/fa';
import { auth } from '../firebase/firebase.config';
import { sendEmailVerification } from 'firebase/auth';

const Login = () => {
  const { login, signInWithGoogle, linkAccounts } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const userCredential = await login(email, password);

      if (!userCredential?.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        setLoading(false);
        return;
      }

      setSuccess("Logged in successfully!");
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      if (err.message?.includes("verify")) {
        setError(err.message);
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found. Consider linking accounts.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Invalid email or password");
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      setSuccess("Logged in with Google successfully!");
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
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
              <Link to="/" className="text-2xl font-bold text-orange-400 flex items-center gap-2 transition-colors duration-200 hover:text-orange-500">
                <FaBookOpen className="inline-block" /> Cover Book
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Login</h1>
            </div>
            <form onSubmit={handleLogin} className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
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
                <Link to="/forgot-password" className="text-orange-400 hover:text-orange-500 transition-colors duration-200">
                  Forgot Password?
                </Link>
              </p>
              <p>
                If you haven't an account, please{" "}
                <Link to="/signup" className="text-orange-400 hover:text-orange-500 transition-colors duration-200">
                  Sign Up
                </Link>{" "}
                here.
              </p>
              <div className="relative">
                <button
                  type="submit"
                  className={`bg-orange-400 text-white rounded-md px-4 py-2 hover:bg-orange-500 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </div>
              {error && <div className="text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
              {success && <div className="text-green-500 bg-green-50 p-3 rounded-md">{success}</div>}
            </form>
            <div className="flex flex-col items-center mt-6">
              <h1 className="font-bold text-black mb-4">Sign in with Google</h1>
              <button
                onClick={handleGoogleLogin}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                <img
                  src="https://img.icons8.com/color/48/000000/google-logo.png"
                  alt="Sign in with Google"
                  className="w-10 h-10"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
