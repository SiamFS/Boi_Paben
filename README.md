# BoiPaben - Book Marketplace Platform

A full-stack MERN application for buying and selling books with community features.

🔗 **Live Website**: [https://boi-paben.onrender.com/](https://boi-paben.onrender.com/)

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

### Quick Start Guide

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/boi-paben.git
   cd boi-paben
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create .env file with environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   # Create .env.local file with environment variables
   npm run dev
   ```

4. **Visit the application**
   - Backend will run on: http://localhost:5000
   - Frontend will run on: http://localhost:5173

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
- `POST /api/auth/verify-firebase` - Verify Firebase token and issue JWT
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/profile` - Update user profile

### Books
- `GET /api/books/all` - Get all books with pagination and filters
- `GET /api/books/categories` - Get all book categories
- `GET /api/books/search/:query` - Search books by title, author, etc.
- `GET /api/books/suggestions/:query` - Get search suggestions
- `GET /api/books/:id` - Get book by ID
- `POST /api/books/upload` - Upload new book
- `PATCH /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart
- `PUT /api/cart/quantity` - Update item quantity

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe session
- `POST /api/payments/cash-on-delivery` - Process COD order
- `POST /api/payments/complete-stripe-payment` - Complete Stripe payment
- `GET /api/payments/history` - Get payment history

### Blog
- `GET /api/blog/posts` - Get all posts with pagination
- `GET /api/blog/posts/:id` - Get post by ID
- `POST /api/blog/posts` - Create post
- `PATCH /api/blog/posts/:id` - Update post
- `DELETE /api/blog/posts/:id` - Delete post
- `POST /api/blog/posts/:id/react` - React to post
- `POST /api/blog/posts/:id/comments` - Add comment
- `DELETE /api/blog/posts/:id/comments/:commentId` - Delete comment

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

## Future Enhancements

### Feature Roadmap
- **Real-time Chat**: Implement messaging between buyers and sellers
- **Recommendation Engine**: Build a ML-based book recommendation system
- **Review System**: Add ratings and reviews for books and sellers
- **Advanced Analytics**: Provide sellers with insights on their listings
- **Social Features**: Allow users to follow favorite sellers and categories
- **Mobile Apps**: Develop native mobile applications

### Technical Roadmap
- **GraphQL API**: Migrate from REST to GraphQL for more efficient data fetching
- **Server-Side Rendering**: Implement Next.js for improved SEO and performance
- **Microservices**: Refactor to a microservices architecture for better scalability
- **CI/CD Pipeline**: Set up automated testing and deployment
- **PWA Features**: Add offline support and push notifications

## Contact & Contributions

Feel free to contact me for any questions or contributions to the project:

- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- **GitHub**: [Your GitHub Profile](https://github.com/yourusername)

Contributions are always welcome. Please read the contributing guidelines before making a pull request.

## Technical Implementation Details

### Frontend Architecture
- **Component Architecture**: Implemented a component-based architecture using React hooks and custom hooks for reusable logic
- **State Management Strategy**: 
  - Zustand for global client state (cart, theme, user preferences)
  - React Query for server state with automatic caching and invalidation
  - Context API for auth state and theme management
- **Route Management**: React Router v6 with dynamic routes and protected routes
- **Form Handling**: React Hook Form with Zod schema validation
- **UI Framework**: Custom UI components built on Tailwind CSS with responsive design

### Backend Architecture
- **API Design**: RESTful API design with proper status codes and response formats
- **Database Interaction**: MongoDB native driver with aggregation pipelines for complex queries
- **Authentication Flow**: 
  - Firebase authentication on the client
  - JWT token verification on the server
  - Role-based authorization
- **Payment Processing**: 
  - Stripe integration with webhooks
  - MongoDB transactions for order processing
- **Error Handling**: Centralized error handling middleware with detailed logging

### Performance Optimizations
- **Frontend**:
  - Code splitting with dynamic imports
  - Memoization of expensive calculations
  - Lazy loading of routes and components
  - Debounced search inputs
  - Image optimization
- **Backend**:
  - Database indexing for query performance
  - Request rate limiting
  - Connection pooling
  - Caching strategies for frequently accessed data

### Security Measures
- **Data Validation**: Input validation on both client and server
- **Authentication**: Firebase and JWT for secure authentication
- **Authorization**: Role-based access control
- **API Security**:
  - CORS configuration
  - Helmet for secure headers
  - Rate limiting to prevent abuse
- **Data Protection**: Secure handling of user data and payment information

## Development Highlights

### Enhanced Search & Filter Functionality
- **Universal Search Bar**: Implemented in the navigation with real-time suggestions
- **Advanced Filters**: Category, price range, and condition filters with smooth animations
- **Search Suggestions**: Built with debounce for optimized performance
- **Search History**: Implemented local storage for recent searches

### Responsive UI & Mobile Optimization
- **Mobile Sidebar**: Created sliding dashboard sidebar with overlay background for mobile
- **Adaptive Layouts**: Fully responsive design adapting to all screen sizes
- **Motion Animations**: Utilized Framer Motion for smooth transitions and feedback
- **Dark Mode**: Theme switching with persistent user preference

### Payment Processing
- **Stripe Integration**: Secure payment processing with webhook handling
- **Cash on Delivery**: Alternative payment option with address validation
- **Order Management**: Complete order history and status tracking
- **Cart Management**: Real-time cart updates with persistence

### Performance & Security
- **Optimized Loading**: Implemented skeleton loaders and progressive loading
- **Authentication**: Firebase authentication with JWT for API security
- **Input Validation**: Comprehensive form validation with Zod
- **Error Handling**: Centralized error handling with user-friendly messages

### Developer Experience
- **Code Organization**: Feature-based folder structure for better maintainability
- **State Management**: Combination of React Query for server state and Zustand for client state
- **Component Reusability**: Created a library of reusable UI components
- **API Client**: Centralized API client with automatic error handling

## Key Challenges & Solutions

### Challenge: Complex Search Functionality
**Solution:** Implemented a multi-tiered search system with:
- Backend text indexing in MongoDB
- Debounced search input to reduce API calls
- Cached search results with React Query
- Real-time search suggestions component reused across the application

### Challenge: Mobile Responsiveness
**Solution:** Developed a fully responsive design with:
- Mobile-first approach using Tailwind breakpoints
- Custom sliding sidebar with Framer Motion animations
- Responsive grid layouts that adapt to screen size
- Touch-friendly UI elements and proper spacing

### Challenge: Payment Processing
**Solution:** Created a secure and robust payment system:
- Integrated Stripe Checkout for secure card processing
- Implemented MongoDB transactions to ensure data consistency
- Built Cash on Delivery flow with address validation
- Created unified order management across payment methods

### Challenge: User Experience Optimization
**Solution:** Enhanced user experience through:
- Progressive loading with skeleton screens
- Predictive search suggestions
- Smart form validation with meaningful error messages
- Persistent state for cart and user preferences
- Smooth animations for user interactions