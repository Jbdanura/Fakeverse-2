const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // For debugging
  console.log('Auth middleware token:', token ? 'Token present' : 'No token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
    
    // Add user from payload
    req.user = decoded.user;
    
    // Fetch user data from database
    const result = await db.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found, authentication failed' });
    }
    
    // Add full user data to request
    req.user = result.rows[0];
    
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
}; 