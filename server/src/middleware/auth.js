import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('❌ No token in Authorization header for', req.method, req.path);
      }
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Token verified for user:', decoded.email);
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ TokenExpiredError:', {
          expiredAt: error.expiredAt,
          currentTime: new Date(),
          path: req.path
        });
      }
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired',
        expiredAt: error.expiredAt
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ JsonWebTokenError:', error.message);
      }
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Authentication error:', error.message);
    }
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next();
  }
};