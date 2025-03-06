const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get comments for a post
router.get('/post/:postId', async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const currentUserId = req.user ? req.user.id : null;
    
    // Verify post exists
    const postCheck = await db.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get comments with user info
    const result = await db.query(
      `SELECT c.id, c.content, c.post_id, c.user_id, c.created_at,
       u.username, u.profile_pic,
       (c.user_id = $2) as is_own_comment
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId, currentUserId || 0]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    next(err);
  }
});

// Add a comment to a post
router.post('/post/:postId', auth, async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { content } = req.body;
    
    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    // Verify post exists
    const postCheck = await db.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create comment
    const result = await db.query(
      `INSERT INTO comments (content, post_id, user_id, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, content, post_id, user_id, created_at`,
      [content, postId, userId]
    );
    
    // Get user details for the new comment
    const userResult = await db.query(
      'SELECT username, profile_pic FROM users WHERE id = $1',
      [userId]
    );
    
    // Combine comment and user data
    const comment = {
      ...result.rows[0],
      username: userResult.rows[0].username,
      profile_pic: userResult.rows[0].profile_pic,
      is_own_comment: true
    };
    
    // Get updated comment count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM comments WHERE post_id = $1',
      [postId]
    );
    
    res.status(201).json({
      comment,
      commentCount: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    console.error('Error creating comment:', err);
    next(err);
  }
});

// Delete a comment
router.delete('/:commentId', auth, async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;
    
    // Get the comment to check ownership and post_id
    const commentCheck = await db.query(
      'SELECT id, post_id, user_id FROM comments WHERE id = $1',
      [commentId]
    );
    
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const comment = commentCheck.rows[0];
    
    // Check if user owns the comment
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }
    
    // Delete the comment
    await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
    
    // Get updated comment count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM comments WHERE post_id = $1',
      [comment.post_id]
    );
    
    res.json({
      message: 'Comment deleted successfully',
      commentCount: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    next(err);
  }
});

module.exports = router; 