const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, profile_pic, bio, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get user by username
router.get('/:username', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, username, profile_pic, bio, created_at FROM users WHERE username = $1',
      [req.params.username]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update user profile
router.put('/me', auth, async (req, res, next) => {
  try {
    const { bio, profile_pic } = req.body;
    
    const result = await db.query(
      'UPDATE users SET bio = $1, profile_pic = $2 WHERE id = $3 RETURNING id, username, email, profile_pic, bio',
      [bio, profile_pic, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 