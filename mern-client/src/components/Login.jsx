import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import { FaBookOpen } from 'react-icons/fa';

const Login = () => {
  const { login, signInWithGoogle } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await login(email, password);
      setSuccess("Logged in successfully!");
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setSuccess("Logged in with Google successfully!");
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-orange-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <Link to="/" className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                <FaBookOpen className="inline-block" /> Cover Book
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Login</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <form
                onSubmit={handleLogin}
                className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7"
              >
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
                    placeholder="Email address"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
                    placeholder="Password"
                    required
                  />
                </div>
                <p>
                  <Link to="/forgot-password" className="text-orange-400">
                    Forgot Password?
                  </Link>
                </p>
                <p>
                  If you haven't an account, please{" "}
                  <Link to="/signup" className="text-orange-400">
                    Sign Up
                  </Link>{" "}
                  here.
                </p>
                <div className="relative">
                  <button type="submit" className="bg-orange-400 text-white rounded-md px-2 py-1">
                    Log In
                  </button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
              </form>
              <div className="flex flex-col items-center mt-6">
                <h1 className="font-bold text-black mb-4">Sign in with Google</h1>
                <button onClick={handleGoogleLogin} className="text-white rounded-md">
                  <img
                    src="https://img.icons8.com/color/48/000000/google-logo.png"
                    alt="Sign in with Google"
                    style={{ width: "40px", height: "40px" }}
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

export default Login;
