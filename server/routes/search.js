const express = require('express');
const db = require('../db');

const router = express.Router();

// Search posts and users
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search posts
    const postsResult = await db.query(`
      SELECT p.*, u.username, u.profile_pic,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.content ILIKE $1
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [`%${q}%`]);
    
    res.json(postsResult.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 