const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get all posts - with optional username filter
router.get('/', async (req, res, next) => {
  try {
    let query = `
      SELECT p.*, u.username, u.profile_pic,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;
    
    const queryParams = [];
    
    // Filter by username if provided
    if (req.query.username) {
      query += ` WHERE u.username = $1`;
      queryParams.push(req.query.username);
    }
    
    // Always order by creation date
    query += ` ORDER BY p.created_at DESC`;
    
    const result = await db.query(query, queryParams);
    
    // Get post IDs to fetch likes
    const postIds = result.rows.map(post => post.id);
    
    // If there are posts, get their likes
    if (postIds.length > 0) {
      const likesQuery = `
        SELECT l.post_id, u.id, u.username, u.profile_pic 
        FROM likes l
        JOIN users u ON l.user_id = u.id
        WHERE l.post_id = ANY($1)
      `;
      
      const likesResult = await db.query(likesQuery, [postIds]);
      
      // Group likes by post_id
      const postLikes = {};
      likesResult.rows.forEach(like => {
        if (!postLikes[like.post_id]) {
          postLikes[like.post_id] = [];
        }
        postLikes[like.post_id].push({
          id: like.id,
          username: like.username,
          profile_pic: like.profile_pic
        });
      });
      
      // Add likes to each post
      result.rows.forEach(post => {
        post.likes_users = postLikes[post.id] || [];
      });
    }
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create a post
router.post('/', auth, async (req, res, next) => {
  try {
    const { content, image_url } = req.body;
    
    const result = await db.query(
      'INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, content, image_url]
    );
    
    const post = result.rows[0];
    
    // Get username and profile pic
    const userInfo = await db.query(
      'SELECT username, profile_pic FROM users WHERE id = $1',
      [req.user.id]
    );
    
    res.status(201).json({
      ...post,
      username: userInfo.rows[0].username,
      profile_pic: userInfo.rows[0].profile_pic,
      like_count: 0,
      comment_count: 0
    });
  } catch (err) {
    next(err);
  }
});

// Get single post
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.username, u.profile_pic,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get users who liked a post
router.get('/:id/likes', auth, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.profile_pic 
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = $1
    `, [req.params.id]);
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 