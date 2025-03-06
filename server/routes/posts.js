const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Get all posts with filtering options
router.get('/', async (req, res, next) => {
  try {
    let { limit = 10, offset = 0, username } = req.query;
    limit = parseInt(limit);
    offset = parseInt(offset);
    
    // Extract token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let currentUser = null;
    
    // If there's a token, try to verify it to get the current user
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
        
        // Get user data from database
        const userResult = await db.query('SELECT id, username FROM users WHERE id = $1', [decoded.user.id]);
        
        if (userResult.rows.length > 0) {
          currentUser = userResult.rows[0];
        }
      } catch (err) {
        console.error('JWT verification error in posts route:', err.message);
        // We'll continue without setting currentUser
      }
    }
    
    // Handle 'me' case
    if (username === 'me') {
      if (!currentUser) {
        return res.status(401).json({ message: 'Authentication required for viewing your posts' });
      }
      
      // Replace 'me' with the actual username for the query
      username = currentUser.username;
    }
    
    // Set up the base query
    let query = `
      SELECT p.*, u.username, u.profile_pic,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;
    
    const queryParams = [];
    
    // Filter by user
    if (username) {
      query += ` WHERE u.username = $1`;
      queryParams.push(username);
    }
    
    // Add ordering and pagination
    query += ` ORDER BY p.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
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
    const postId = req.params.id;
    const userId = req.user ? req.user.id : null;
    
    // Get post with like count and user info
    const result = await db.query(
      `SELECT p.*, u.username, u.profile_pic,
       (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
       (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
       (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $2) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [postId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get users who liked a post
router.get('/:id/likes', async (req, res, next) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user ? req.user.id : null;
    
    // Get users who liked the post - no dependency on followers table
    const result = await db.query(
      `SELECT u.id, u.username, u.profile_pic, u.bio
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = $1
       ORDER BY l.created_at DESC`,
      [postId]
    );
    
    // Map results to include current_user flag
    const likedByUsers = result.rows.map(user => ({
      ...user,
      is_current_user: currentUserId ? user.id === currentUserId : false
    }));
    
    res.json(likedByUsers);
  } catch (err) {
    console.error('Error fetching likes:', err);
    next(err); // Pass to error handler instead of sending 500
  }
});

// Like a post
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Check if post exists
    const postResult = await db.query('SELECT * FROM posts WHERE id = $1', [postId]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already liked
    const likeResult = await db.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    
    if (likeResult.rows.length > 0) {
      // Get current like count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM likes WHERE post_id = $1',
        [postId]
      );
      
      const currentCount = parseInt(countResult.rows[0].count);
      
      return res.status(400).json({ 
        message: 'Post already liked',
        likeCount: currentCount
      });
    }
    
    // Add like - make sure created_at is set
    await db.query(
      'INSERT INTO likes (post_id, user_id, created_at) VALUES ($1, $2, NOW())',
      [postId, userId]
    );
    
    // Get updated like count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [postId]
    );
    
    const newCount = parseInt(countResult.rows[0].count);
    console.log(`Like added to post ${postId}. New count: ${newCount}`);
    
    res.json({ 
      message: 'Post liked successfully', 
      likeCount: newCount
    });
  } catch (err) {
    console.error("Error liking post:", err);
    next(err);
  }
});

// Unlike a post - similar updates
router.delete('/:id/like', auth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Delete like
    const deleteResult = await db.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    
    if (deleteResult.rowCount === 0) {
      // If no rows were deleted, the post wasn't liked
      const countResult = await db.query(
        'SELECT COUNT(*) FROM likes WHERE post_id = $1',
        [postId]
      );
      
      const currentCount = parseInt(countResult.rows[0].count);
      
      return res.status(400).json({ 
        message: 'Post was not liked',
        likeCount: currentCount
      });
    }
    
    // Get updated like count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [postId]
    );
    
    const newCount = parseInt(countResult.rows[0].count);
    
    // Get remaining users who liked the post
    const likesResult = await db.query(
      `SELECT u.id, u.username, u.profile_pic, u.bio
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = $1
       ORDER BY l.created_at DESC`,
      [postId]
    );
    
    res.json({ 
      message: 'Post unliked successfully', 
      likeCount: newCount,
      likes: likesResult.rows.map(user => ({
        ...user,
        is_following: false, // Default value
        is_current_user: user.id === userId
      }))
    });
  } catch (err) {
    console.error("Error unliking post:", err);
    next(err);
  }
});

// Check if user liked a post
router.get('/:id/liked', auth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Check if post is liked by user
    const likeResult = await db.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    
    // Get total like count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [postId]
    );
    
    res.json({ 
      liked: likeResult.rows.length > 0,
      likeCount: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 