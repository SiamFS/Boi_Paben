import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../home/home";
import Shop from "../shop/shop";
import About from "../components/about";
import DashboardLayout from "../Dashboard/DashboardLayout";
import UploadBook from "../Dashboard/UploadBook";
import SignUp from "../components/Signup";
import Login from "../components/Login";
import Logout from "../components/logout";
import SearchBox from "../components/SearchBox"; 
import ForgotPassword from "../components/FogotPassword";
import ManageBooks from "../Dashboard/ManageBooks";
import EditBooks from "../Dashboard/EditBooks";
import SingleBook from "../shop/singlebook";


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
        path: "/search/:title",
        element: <SearchBox />,
        loader: ({ params }) => fetch(`http://localhost:1526/search/${params.title}`),
      },
      {
        path: '/book/:id',
        element: <SingleBook />,
        loader: ({ params }) => fetch(`http://localhost:1526/book/${params.id}`), 
      }
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard", 
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
        path: "/dashboard/edit/:id",
        element: <EditBooks/>,
        loader: ({ params }) => fetch(`http://localhost:1526/book/${params.id}`),
      }
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
