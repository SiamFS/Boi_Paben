import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startScheduler } from './services/scheduler.js';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

export const createServer = async () => {
  const app = express();

  // Connect to MongoDB asynchronously without blocking server startup
  connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    // Server still starts, but with limited functionality
  });
  
  // Start scheduler asynchronously without blocking
  setImmediate(() => {
    startScheduler();
  });
  
  const corsOptions = {
    origin: (origin, callback) => {
      // List of allowed origins for both development and production
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'https://boi-paben.onrender.com',
        process.env.CLIENT_URL_LOCAL,
        process.env.CLIENT_URL,
      ].filter(Boolean);

      // Allow requests with no origin (mobile apps, curl requests) or matching origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  };

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
  });

  app.use('/api/', limiter);
  app.get('/', (req, res) => {
    res.json({ 
      message: 'BoiPaben API', 
      version: '1.0.0',
      status: 'active' 
    });
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/blog', blogRoutes);
  app.use('/api/reports', reportRoutes);

  app.use(errorHandler);

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
};