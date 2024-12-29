import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../home/home";
import Shop from "../shop/shop";
import About from "../components/about";
import Blog from "../components/Blog";
import SingleBook from "../shop/singlebook";
import DashboardLayout from "../Dashboard/DashboardLayout";
import Dashboard from "../Dashboard/Dashboard";
import UploadBook from "../Dashboard/UploadBook";
import ManageBooks from "../Dashboard/ManageBooks";
import EditBooks from "../Dashboard/EditBooks";
import SignUp from "../components/Signup";
import Login from "../components/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Logout from "../components/logout";
import SearchBox from "../components/SearchBox";
import AddToPayment from "../shop/add_to_payment"; 
import ForgotPassword from "../components/FogotPassword";
import PaymentSuccess from "../components/PaymentSucess";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/shop",
        element: <Shop />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/book/:id",
        element: <SingleBook />,
        loader: ({ params }) => fetch(`https://cse471-project-backend.onrender.com/book/${params.id}`),
      },
      {
        path: "/search/:title",
        element: <SearchBox />,
        loader: ({ params }) => fetch(`https://cse471-project-backend.onrender.com/search/${params.title}`),
      },
      {
        path: "/add-to-payment",
        element: <AddToPayment />, 
      },
      {
        path: "/payment-success",
        element: <PaymentSuccess />,
      }
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/upload",
        element: <UploadBook />,
      },
      {
        path: "/dashboard/manage",
        element: <ManageBooks />,
      },
      {
        path: "/dashboard/edit-books/:id",
        element: <EditBooks />,
        loader: ({ params }) => fetch(`https://cse471-project-backend.onrender.com/book/${params.id}`),
      },
    ],
  },
  {
    path: "signup",
    element: <SignUp />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "logout",
    element: <Logout />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
]);

export default router;