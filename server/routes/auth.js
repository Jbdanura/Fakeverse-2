const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if email already exists
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Check if username already exists
    const usernameCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    
    const newUser = result.rows[0];
    
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Check if user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const payload = {
      user: {
        id: user.id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        // Return user info without password
        const { password, ...userWithoutPassword } = user;
        
        res.json({
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (err) {
    next(err);
  }
});

// Validate token
router.get('/validate', async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
      
      // Get full user data with counts
      const result = await db.query(
        'SELECT id, username, email, profile_pic, bio, created_at FROM users WHERE id = $1',
        [decoded.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get post count
      const postsResult = await db.query(
        'SELECT COUNT(*) FROM posts WHERE user_id = $1',
        [decoded.user.id]
      );
      
      // Get follower count
      let followerCount = 0;
      try {
        const followerResult = await db.query(
          'SELECT COUNT(*) FROM followers WHERE followed_id = $1',
          [decoded.user.id]
        );
        followerCount = parseInt(followerResult.rows[0].count || 0);
      } catch (err) {
        console.log('Error getting follower count:', err.message);
      }
      
      // Get following count
      let followingCount = 0;
      try {
        const followingResult = await db.query(
          'SELECT COUNT(*) FROM followers WHERE follower_id = $1',
          [decoded.user.id]
        );
        followingCount = parseInt(followingResult.rows[0].count || 0);
      } catch (err) {
        console.log('Error getting following count:', err.message);
      }
      
      const user = {
        ...result.rows[0],
        post_count: parseInt(postsResult.rows[0].count || 0),
        follower_count: followerCount,
        following_count: followingCount
      };
      
      return res.json({ user });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    next(err);
  }
});

// Add this route for token refresh
router.post('/refresh', async (req, res, next) => {
  try {
    // Get token from request body
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
    
    // Check if user exists
    const result = await db.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Generate a new token with a much longer expiration time to reduce refresh needs
    const payload = {
      user: {
        id: user.id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '7d' }, // Increase token lifetime to 7 days
      (err, newToken) => {
        if (err) throw err;
        
        res.json({
          token: newToken,
          user
        });
      }
    );
  } catch (err) {
    // If token verification fails, return 401
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    next(err);
  }
});

module.exports = router; 