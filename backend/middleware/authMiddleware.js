import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'resumeai_jwt_secret_key_2026';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Allow guest token bypass for instant access
  if (token.startsWith('guest_token') || token === 'guest') {
    req.user = '000000000000000000000000';
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
