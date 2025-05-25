# BoiPaben - Book Marketplace Platform

A full-stack MERN application for buying and selling books with community features.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth with Firebase
- 📚 **Book Management**: Upload, edit, and manage book listings
- 🛒 **Shopping Cart**: Persistent cart with real-time updates
- 💳 **Payment Processing**: Stripe integration and Cash on Delivery
- 📝 **Blog System**: Community blog with reactions and comments
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Mobile-first approach
- 🔍 **Search & Filter**: Advanced search and category filtering

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Query for server state
- Zustand for client state
- React Hook Form + Zod for validation
- Framer Motion for animations
- Stripe.js for payments

### Backend
- Node.js with Express
- MongoDB with native driver
- JWT authentication
- Stripe payment processing
- Express Rate Limiting
- Helmet for security

## Project Structure

```
boipaben/
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Feature modules
│   │   ├── lib/          # Utilities and helpers
│   │   └── styles/       # Global styles
│   └── .env.local        # Frontend environment variables
├── server/                # Backend Express app
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   └── .env              # Backend environment variables
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Firebase project
- Stripe account
- ImgBB API key

### Backend Setup

```bash
cd server
npm install
```

Create `.env` file with the provided environment variables.

### Frontend Setup

```bash
cd client
npm install
```

Create `.env.local` file with the provided environment variables.

## Development

### Run Backend
```bash
cd server
npm run dev
```

### Run Frontend
```bash
cd client
npm run dev
```

## Deployment

### Backend on Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `.env`
6. Deploy

### Frontend on Render

1. Create a new Static Site
2. Connect your GitHub repository
3. Set build command: `cd client && npm install && npm run build`
4. Set publish directory: `client/dist`
5. Add all environment variables from `.env.local`
6. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/verify-firebase` - Verify Firebase token

### Books
- `GET /api/books/all` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books/upload` - Upload new book
- `PATCH /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe session
- `POST /api/payments/cash-on-delivery` - Process COD order

### Blog
- `GET /api/blog/posts` - Get all posts
- `POST /api/blog/posts` - Create post
- `POST /api/blog/posts/:id/react` - React to post
- `POST /api/blog/posts/:id/comments` - Add comment

## Environment Variables

### Backend (.env)
- `NODE_ENV` - Production/development
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `CLIENT_URL` - Frontend URL
- `IMGBB_API_KEY` - ImgBB API key

### Frontend (.env.local)
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `VITE_IMGBB_API_KEY` - ImgBB API key

## Security Features

- JWT token authentication
- Input validation and sanitization
- Rate limiting on API routes
- Secure headers with Helmet
- CORS configuration
- Environment-based secrets

## Performance Optimizations

- Lazy loading for routes
- Image optimization with ImgBB
- Query caching with React Query
- Code splitting with dynamic imports
- Database connection pooling
- Debounced search

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.